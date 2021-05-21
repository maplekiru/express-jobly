"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
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
    equity: "0.05",
  };
  

  test("works", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const job = await Job.update(id, updateData);
    expect(job).toEqual({
      id,
      ...updateData,
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${id}`);
    expect(result.rows).toEqual([{
      id,
      title: "j1 update",
      salary: 10,
      equity: "0.05",
      companyHandle: "c1"
    }]);
  });

  test("works: null fields", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const updateDataSetNulls = {
      title: "j1 update",
      salary: null,
      equity: null,
    };

    const job = await Job.update(id, updateDataSetNulls);
    expect(job).toEqual({
      id,
      ...updateDataSetNulls,
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = ${id}`);
    expect(result.rows).toEqual([{
      id,
      title: "j1 update",
      salary: null,
      equity: null,
      companyHandle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    try {
      await Job.update(id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
  test("not found if invalid id query", async function () {
    try {
      let job = await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
  const jobs = await Job.findAll();
  const id = jobs[0].id;
    await Job.remove(id);
    const res = await db.query(
      `SELECT id FROM jobs WHERE id=${id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if invalid id query", async function () {
    try {
      let job = await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


// TODO add a test for filter method
/************************************** filter */

