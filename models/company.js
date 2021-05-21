"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }

  /** Filter companies by filter `data`.
   *
   * Data can include: {name, minEmployees, maxEmployees}
   *
   * Returns [{handle, name, description, numEmployees(optional), logoUrl}...]
   *
   * Throws NotFoundError if no companies found.
   */

  static async filter(data) {
    const { whereCols, values } = Company._sqlForFiltering(
      data,
      {
        minEmployees: "num_employees",
        maxEmployees: "num_employees",
      });

    let includeEmployees = '';
    if (whereCols.includes('num_employees')) {
      includeEmployees = ', num_employees AS "numEmployees"'
    }

    const querySql = `
      SELECT handle, name, description ${includeEmployees}, logo_url AS "logoUrl"
          FROM companies
          WHERE ${whereCols}
          ORDER BY name`;

    let result;
    try {
      result = await db.query(querySql, [...values]);
    } catch (err) {
      throw new BadRequestError(err);
    }
    const companies = result.rows;

    return companies;
  }

  // mention what jsToSQL (type / what to expect)

  /** Given two objects: first one's keys in camel case format and values to filter by in db.
and second one keys in keys in camel case format and corresponding values is column name in SQL db.
 
Input(dataToFilter, jsToSql)
dataToFilter---->>{name: 'Aliya', minEmployees: 32}
jsToSql---->>{minEmployees:num_employees}

Returns {whereCols, values}
whereCols ----> '"name"=$1', AND '"num_employees">$2',....
values ----> [%Mitchell%, 32, .....]

Throws bad request error if dataToFilter is empty or minEmployees is greater than maxEmployees.
**/
  static _sqlForFiltering(dataToFilter, jsToSql) {
    // dont throw error and just return empty
    const keys = Object.keys(dataToFilter);
    if (keys.length === 0) throw new BadRequestError("No data");
    if (dataToFilter.minEmployees > dataToFilter.maxEmployees) {
      throw new BadRequestError("Min employees can't be greater than max employees");
    }

    // {name: 'Mitchell', num_employees } => ['"name"=$1', '"age"=$2']
    const cols = [];
    const values = [];

    if (dataToFilter['name']) {
      values.push(`%${dataToFilter['name']}%`)
      cols.push(`name ILIKE $${values.length}`) 
    }
    if (dataToFilter['minEmployees']) {
      values.push(dataToFilter['minEmployees']) 
      cols.push(`"${jsToSql['minEmployees'] || 'minEmployees'}">=$${values.length}`);
    }
    if (dataToFilter['maxEmployees']) {
      values.push(dataToFilter['maxEmployees']) 
      cols.push(`"${jsToSql['maxEmployees'] || 'maxEmployees'}"<=$${values.length}`);
    }
    return {
      whereCols: cols.join(' AND '),
      values: values
    };
  }
}

module.exports = Company;
