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
    salary: 50000,
    equity: "0",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "testJob",
      companyHandle: "c2",
      salary: 50000,
      equity: "0",
    });

    const result = await db.query(
      `SELECT id, title, company_handle AS "companyHandle", salary, equity
        FROM jobs
        WHERE title = 'testJob'`
    );
    expect(result.rows).toEqual([{
      id: expect.any(Number),
      title: "testJob",
      companyHandle: "c2",
      salary: 50000,
      equity: "0",
    }]);
  });
});

/************************************** findAll */
describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "Test Job",
        salary: 100000,
        id: expect.any(Number),
        equity: "0",
        companyHandle: "c1",
      },
      {
        title: "Test Job 2",
        salary: 120000,
        id: expect.any(Number),
        equity: "0.02",
        companyHandle: "c2",
      }
    ]);
  });

  test("works: filter title", async function () {
    const searchFilter = {
      title: "Test Job"
    };
    let jobs = await Job.findAll(searchFilter);
    expect(jobs).toEqual([
      {
        title: "Test Job",
        salary: 100000,
        id: expect.any(Number),
        equity: "0",
        companyHandle: "c1",
      }
    ]);
  });

  test("works: filter minSalary", async function () {
    const searchFilter = {
      minSalary: 12000
    };
    let jobs = await Job.findAll(searchFilter);
    expect(jobs).toEqual([
      {
        title: "Test Job",
        salary: 100000,
        id: expect.any(Number),
        equity: "0",
        companyHandle: "c1",
      },
      {
        title: "Test Job 2",
        salary: 120000,
        id: expect.any(Number),
        equity: "0.02",
        companyHandle: "c2",
      }
    ]);
  });

  test("works: filter hasEquity", async function () {
    const searchFilter = {
      hasEquity: true
    };
    let jobs = await Job.findAll(searchFilter);
    expect(jobs).toEqual([
      {
        title: "Test Job 2",
        salary: 120000,
        equity: "0.02",
        id: expect.any(Number),
        companyHandle: "c2",
      }
    ]);
  });

  test("works: filter hasEquity", async function () {
    const searchFilter = {
      title: "Test Job",
      hasEquity: false
    };
    let jobs = await Job.findAll(searchFilter);
    expect(jobs).toEqual([
      {
        title: "Test Job",
        salary: 100000,
        equity: "0",
        id: expect.any(Number),
        companyHandle: "c1",
      }
    ]);
  });

});

/************************************** get */

describe("get a job", function () {
  test("works", async function () {
    let job = await Job.get("1");
    expect(job).toEqual({
      title: "Test Job 1",
      salary: 10000,
      equity: "0",
      companyHandle: "c1",
    });
  });

  test.only("not found if no such job id", async function () {
    try {
      await Job.get(999999);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function() {
  const updateData = {
    title: "New Job",
    salary: 50000,
    equity: "0.05",
    companyHandle: "c2"
  };

  test("works", async function(){
    let job = await Job.update("1", updateData);
    expect(company).toEqual({
      id: "1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
          FROM jobs
          WHERE id = '1'`
    );
    expect(result.rows).toEqual([
      {
        id: "1",
        title: "New Job",
        salary: 50000,
        equity: "0.05",
        companyHandle: "c2"
      }
    ])
  })

  test("not found if no such job id", async function () {
    try {
      await Job.update("whatever", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("1", {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
})

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("1");
    const res = await db.query(
      "SELECT handle FROM jobs WHERE id='1'"
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
