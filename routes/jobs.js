"use strict";
/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdminLoggedIn } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
// TODO add filtering schema

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns {id, title, salary, equity, companyHandle }
 *
 * Authorization required: Admin
 */

router.post("/", ensureAdminLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [ {id, title, salary, equity, companyHandle }, ...] }
 *
 * 
 // TODO add a feature for filtering
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const jobs = await Job.findAll();
  return res.json({ jobs });

});

/** GET /[id]  =>  { job }
 *
 *  job is {id, title, salary, equity, companyHandle }

 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns {id, title, salary, equity, companyHandle }
 *
 * Authorization required: Admin
 */

router.patch("/:id", ensureAdminLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: Admin
 */

router.delete("/:id", ensureAdminLoggedIn, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});

module.exports = router;
