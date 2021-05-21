"use strict";

const request = require("supertest");

const { BadRequestError, NotFoundError } = require('../expressError');

const Job = require('../models/job')

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", function () {
  const newJob = {
    title: "new job",
    salary: 10,
    equity: 0.15,
    companyHandle: 'c1'
  };

  test("ok for users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    console.log('resbody', resp.body)
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new job",
        salary: 10,
        equity: "0.15",
        companyHandle: 'c1'
      }
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new Job",
        salary: 5,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new job",
        salary: "10",
        equity: "0.15",
        companyHandle: 'c1'
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("Does not work for non Admin User", async function () {
    const resp = await request(app)
      .post(`/jobs`)
      .send({
        ...newJob
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
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
            equity: "0.1",
            companyHandle: 'c1'
          },
          {
            id: expect.any(Number),
            title: "j3",
            salary: 3,
            equity: "1",
            companyHandle: 'c2'
          }
        ],
    });
  });



  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

// TODO: Add Filtering tests here

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app).get(`/jobs/${id}`);
    expect(resp.body).toEqual({
      job: {
        id,
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: 'c1'
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });

  test("not found for invalid id query (non-integer)", async function () {
    const resp = await request(app).get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for users", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id,
        title: "j1-new",
        salary: 1,
        equity: "0",
        companyHandle: 'c1'
      },
    });
  });

  test("unauth for anon", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        title: "j1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "new job 0",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        id: 10,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on companyHandle change attempt", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        companyHandle: "c4",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        salary: "5",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("Does not work for non Admin User", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });
    const resJob = await request(app).get(`/jobs/${id}`);
    expect(resJob.body).toEqual({
      job: {
        id,
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: 'c1'
      }
    });
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .delete(`/jobs/${id}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${id}` });
  });

  test("unauth for anon", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .delete(`/jobs/${id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for invalid id query", async function () {
    const resp = await request(app)
      .delete(`/jobs/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("not found for job that does not exist", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });


  test("Does not work for non AdminUser", async function () {
    const jobs = await Job.findAll();
    const id = jobs[0].id;
    const resp = await request(app)
      .delete(`/jobs/${id}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: {
        message: "Unauthorized",
        status: 401
      }
    });

    const resJob = await request(app).get(`/jobs/${id}`);
    expect(resJob.body).toEqual({
      job: {
        id,
        title: "j1",
        salary: 1,
        equity: "0",
        companyHandle: 'c1'
      }
    });
  });
});






