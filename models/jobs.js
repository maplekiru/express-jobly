"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /** Create a Job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {

    //convert boolean to 0 or 1 to store in db

    const result = await db.query(
      `INSERT INTO jobs(
          title,
          salary,
          equity,
          company_handle)
          VALUES
             ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        companyHandle,
      ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
      `SELECT 
          id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"
        FROM jobs
        ORDER BY title`);
    return jobsRes.rows;
  }

  /** Given a job handle, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    let jobRes;
    try {
      jobRes = await db.query(
        `SELECT 
              id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
          FROM jobs
          WHERE id = $1`,
        [id]);
    } catch (err) {
      throw new BadRequestError();
    }


    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
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

  static async update(id, data) {
    // const { setCols, values } = sqlForPartialUpdate(
    //   data,
    //   {
    //     numEmployees: "num_employees",
    //     logoUrl: "logo_url",
    //   });
    // const handleVarIdx = "$" + (values.length + 1);

    // const querySql = `
    //   UPDATE companies
    //   SET ${setCols}
    //     WHERE handle = ${handleVarIdx}
    //     RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    // const result = await db.query(querySql, [...values, handle]);
    // const company = result.rows[0];

    // if (!company) throw new NotFoundError(`No company: ${handle}`);

    // return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    // const result = await db.query(
    //   `DELETE
    //        FROM companies
    //        WHERE handle = $1
    //        RETURNING handle`,
    //   [handle]);
    // const company = result.rows[0];

    // if (!company) throw new NotFoundError(`No company: ${handle}`);
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
    // const { whereCols, values } = Company._sqlForFiltering(
    //   data,
    //   {
    //     minEmployees: "num_employees",
    //     maxEmployees: "num_employees",
    //   });

    // let includeEmployees = '';
    // if (whereCols.includes('num_employees')) {
    //   includeEmployees = ', num_employees AS "numEmployees"'
    // }

    // const querySql = `
    //   SELECT handle, name, description ${includeEmployees}, logo_url AS "logoUrl"
    //       FROM companies
    //       WHERE ${whereCols}
    //       ORDER BY name`;

    // let result;
    // try {
    //   result = await db.query(querySql, [...values]);
    // } catch (err) {
    //   throw new BadRequestError(err);
    // }
    // const companies = result.rows;

    // return companies;
  }

  // mention what jsToSQL (type / what to expect)

  /** Given two objects: first one's keys in camel case format and values to filter by in db.
and second one keys in keys in camel case format and corresponding values is column name in SQL db.
accepts {JS keyname: filter value, ....}, { JS keyname: "SQL column name",......}.
  
Returns {whereCols, values}

whereCols ----> '"name"=$1', AND '"num_employees">$2',....
values ----> [%Mitchell%, 32, .....]

Throws bad request error if dataToFilter is empty or minEmployees is greater than maxEmployees.
**/
  // static _sqlForFiltering(dataToFilter, jsToSql) {
  //   // dont throw error and just return empty
  //   const keys = Object.keys(dataToFilter);
  //   if (keys.length === 0) throw new BadRequestError("No data");
  //   if (dataToFilter.minEmployees > dataToFilter.maxEmployees) {
  //     throw new BadRequestError("Min employees can't be greater than max employees");
  //   }

  //   // {name: 'Mitchell', num_employees } => ['"name"=$1', '"age"=$2']
  //   const cols = [];
  //   const values = [];

  //   // just use if statements 
  //   if (dataToFilter['name']) {
  //     values.push(`%${dataToFilter['name']}%`)
  //     cols.push(`name ILIKE $${values.length}`) // use values.length!
  //   }
  //   if (dataToFilter['minEmployees']) {
  //     values.push(dataToFilter['minEmployees']) //values.push (hard code values)
  //     cols.push(`"${jsToSql['minEmployees'] || 'minEmployees'}">=$${values.length}`);
  //   }
  //   if (dataToFilter['maxEmployees']) {
  //     values.push(dataToFilter['maxEmployees']) //values.push (hard code values)
  //     cols.push(`"${jsToSql['maxEmployees'] || 'maxEmployees'}"<=$${values.length}`);
  //   }
  //   return {
  //     whereCols: cols.join(' AND '),
  //     values: values
  //   };
  // }
}

module.exports = Job;