"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");

const router = new express.Router();

/** POST / { job } => { job }
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin only
 *
 */

router.post("/", ensureIsAdmin, async function () {
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

  if(query.salary) {
    query.minSalary = Number(query.minSalary)
  }

})
