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

describe("create a job", function () {
  const newJob = {
    title: "testJob",
    companyHandle: "c2",
    salary: "50000",
    equity: 0
  }

  test("works", async function() {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const results = await db.query(
      `SELECT title, company_handle, salary, equity
        FROM jobs
        WHERE title = 'testJob'`
    );
    expect(result.rows).toEqual([
      newJob
    ])
  });
})

/************************************** FindAll */
describe("findAll", function () {
  test("")
})