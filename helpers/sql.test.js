const { sqlForPartialUpdate, sqlForFiltering } = require('./sql');
const { BadRequestError } = require('../expressError');

describe("test sqlForPartialUpdate", function () {
  test("valid inputs", function () {
    const dataToUpdate = { firstName: 'test1', lastName: "test2" }
    const jsToSql = { firstName: "first_name", lastName: "last_name" }
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);


    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ["test1", "test2"]
    });
  });

  test("Invalid dataToUpdate inputs", function () {
    const dataToUpdate = {}
    const jsToSql = { firstName: "first_name", lastName: "last_name" }
    try {
      const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("missing jsSql keyValue pair", function () {
    const dataToUpdate = { firstName: 'test1', lastName: "test2" }
    const jsToSql = { lastName: "last_name" }
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);


    expect(result).toEqual({
      setCols: '"firstName"=$1, "last_name"=$2',
      values: ["test1", "test2"]
    });
  });
});

describe("name Filter", function () {
  test("valid inputs", function () {
    const dataToFilter = { name: "C1" }
    const jsToSql = { name: "name", minEmployees: "num_employees" }
    const result = sqlForFiltering(dataToFilter, jsToSql);

    expect(result).toEqual({
      whereCols: 'name ILIKE $1',
      values: ["%C1%"]
    });
  });

  test("minEmployees Filter", function () {
    const dataToFilter = { minEmployees: 2 }
    const jsToSql = { name: "name", minEmployees: "num_employees" }
    const result = sqlForFiltering(dataToFilter, jsToSql);

    expect(result).toEqual({
      whereCols: '"num_employees">$1',
      values: ['2']
    });
  });

  test("maxEmployees Filter", function () {
    const dataToFilter = { maxEmployees: 2 }
    const jsToSql = { name: "name", maxEmployees: "num_employees" }
    const result = sqlForFiltering(dataToFilter, jsToSql);

    expect(result).toEqual({
      whereCols: '"num_employees"<$1',
      values: ['2']
    });
  });

  test("all Filter", function () {
    const dataToFilter = { name: "C1", minEmployees: 1, maxEmployees: 3 }
    const jsToSql = { name: "name", minEmployees: "num_employees", maxEmployees: "num_employees" }
    const result = sqlForFiltering(dataToFilter, jsToSql);

    expect(result).toEqual({
      whereCols: 'name ILIKE $1 AND "num_employees">$2 AND "num_employees"<$3',
      values: ['%C1%', '1', '3']
    });
  });

  test("maxEmp > minEmp fail", function () {
    const dataToFilter = { minEmployees: 3, maxEmployees: 1 }
    const jsToSql = { minEmployees: "num_employees", maxEmployees: "num_employees" }
    try {
      const result = sqlForFiltering(dataToFilter, jsToSql);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("Invalid dataToFilter inputs", function () {
    const dataToFilter = {}
    const jsToSql = { name: "name", minEmployees: "num_employees" }
    try {
      const result = sqlForFiltering(dataToFilter, jsToSql);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  // test("missing jsSql keyValue pair", function () {
  //     const dataToUpdate = { firstName: 'test1', lastName: "test2" }
  //     const jsToSql = {lastName: "last_name" }
  //     const result = sqlForPartialUpdate(dataToUpdate, jsToSql);


  //     expect(result).toEqual({
  //         setCols: '"firstName"=$1, "last_name"=$2',
  //         values: ["test1", "test2"]
  //     });
});
