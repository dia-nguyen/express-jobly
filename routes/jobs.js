"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobFilterSchema = require("../schemas/jobFilter.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } => { job }
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login and admin only
 *
 */
router.post("/",ensureLoggedIn, ensureIsAdmin, async function () {
  const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
})

/**
 * GET / =>
 *  { jobs : [ { id, title, salary, equity, companyHandle } ] }
 *
 * Can filter on provided search areas:
 *  - title
 *  - hasEquity
 *  - minSalary
 *
 *  Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const query = req.query;

  if(query.minSalary) {
    query.minSalary = Number(query.minSalary)
  }


  if(query.hasEquity === "true") {
    query.hasEquity = true
  }


  const validator = jsonschema.validate(
    query,
    jobFilterSchema,
    {required: true}
  )
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const jobs = await Job.findAll(query);
  return res.json({ jobs });
})

/** GET /[id] => { job }
 *  Job is { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function(req, res, next){
  const job = await Job.get(req.params.id);
  return res.json({ job });
})

/** PATCH /[id] { salary, equity } => { job }
 *
 * Patches job data.
 *
 * fields can be: { salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login and is admin
 */
router.patch("/id", ensureLoggedIn, ensureIsAdmin, async function(req, res, next){
  const validator = jsonschema.validate(
    req.body,
    jobUpdateSchema,
    {required:true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
})

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login and is admin
 */

router.delete("/:id", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});

module.exports = router;
