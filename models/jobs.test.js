"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "j1",
    salary: 1,
    equity: "0",
    companyHandle: 'c1'
  };

  test("works", async function () {
    let job = await Job.create(newJob);

    expect(job).toEqual({id: job.id, ...newJob});

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${job.id}`);
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: 'c1'
      }
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.10",
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 3,
        equity: "1",
        companyHandle: 'c2'
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  const newJob = {
    title: "j1",
    salary: 1,
    equity: "0",
    companyHandle: 'c1'
  };
  test("works", async function () {
    let job = await Job.create(newJob);
    let getJob = await Job.get(job.id);
    expect(getJob).toEqual({
      id: job.id,
      title: "j1",
      salary: 1,
      equity: "0",
      companyHandle: 'c1'
    });
  });

  test("not found if no such Job id exists", async function () {
    try {
      let job = await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if invalid id query", async function () {
    try {
      let job = await Job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "j1 update",
    salary: 10,
    equity: .05,
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      ...updateData,
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "j1 update",
      salary: 10,
      equity: .05,
      companyHandle: "c1"
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "j1 update",
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(company).toEqual({
      id: 1,
      ...updateDataSetNulls,
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "j1 update",
      salary: null,
      equity: null,
      companyHandle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** filter */

describe("filter", function () {
  const filterData = {
    title: "j1"
  };

  test("works with good data filter", async function () {
    let jobs = await Job.filter(filterData);
    expect(jobs).toEqual([{
      title: "j1",
      salary: 1,
      equity: 0,
      companyHandle: 'c1'
    }]);
  });

  test("works with bad data", async function () {
    try {
      const companies = await Job.filter({ nope: "nope" });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


// describe("Test for _sqlForFiltering", function () {
//   test("valid inputs", function () {
//     const dataToFilter = { name: "C1" }
//     const jsToSql = { name: "name", minEmployees: "num_employees" }
//     const result = Company._sqlForFiltering(dataToFilter, jsToSql);

//     expect(result).toEqual({
//       whereCols: 'name ILIKE $1',
//       values: ["%C1%"]
//     });
//   });

//   test("minEmployees Filter", function () {
//     const dataToFilter = { minEmployees: 2 }
//     const jsToSql = { name: "name", minEmployees: "num_employees" }
//     const result = Company._sqlForFiltering(dataToFilter, jsToSql);

//     expect(result).toEqual({
//       whereCols: '"num_employees">=$1',
//       values: [2]
//     });
//   });

//   test("maxEmployees Filter", function () {
//     const dataToFilter = { maxEmployees: 2 }
//     const jsToSql = { name: "name", maxEmployees: "num_employees" }
//     const result = Company._sqlForFiltering(dataToFilter, jsToSql);

//     expect(result).toEqual({
//       whereCols: '"num_employees"<=$1',
//       values: [2]
//     });
//   });

//   test("all Filter", function () {
//     const dataToFilter = { name: "C1", minEmployees: 1, maxEmployees: 3 }
//     const jsToSql = { name: "name", minEmployees: "num_employees", maxEmployees: "num_employees" }
//     const result = Company._sqlForFiltering(dataToFilter, jsToSql);

//     expect(result).toEqual({
//       whereCols: 'name ILIKE $1 AND "num_employees">=$2 AND "num_employees"<=$3',
//       values: ['%C1%', 1, 3]
//     });
//   });

//   test("maxEmp > minEmp fail", function () {
//     const dataToFilter = { minEmployees: 3, maxEmployees: 1 }
//     const jsToSql = { minEmployees: "num_employees", maxEmployees: "num_employees" }
//     try {
//       const result = Company._sqlForFiltering(dataToFilter, jsToSql);
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });

//   test("Invalid dataToFilter inputs", function () {
//     const dataToFilter = {}
//     const jsToSql = { name: "name", minEmployees: "num_employees" }
//     try {
//       const result = Company._sqlForFiltering(dataToFilter, jsToSql);
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });

  // test("missing jsSql keyValue pair", function () {
  //     const dataToUpdate = { firstName: 'test1', lastName: "test2" }
  //     const jsToSql = {lastName: "last_name" }
  //     const result = sqlForPartialUpdate(dataToUpdate, jsToSql);


  //     expect(result).toEqual({
  //         setCols: '"firstName"=$1, "last_name"=$2',
  //         values: ["test1", "test2"]
  //     });
// });
