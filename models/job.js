"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /**
   * Creates a job (from data), updates db, and returns new job data
   *
   * data should be {title, salary, equity, companyHandle }
   *
   * Returns {id, title, salary, equity, companyHandle }
   *
   */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs(
          title,
          salary,
          equity,
          company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /*
   * Constructs a WHERE clause and parameterized query
   * for filtering company by title, minSalary, and/or hasEquity
   *
   * searchFilter should be { title, minSalary, hasEquity }
   *
   * Returns { whereClause: "WHERE title ILIKE $1", values: ["apple"]}
   */

  static constructWhereClause(searchFilter) {
    const query = [];
    const values = [];
    let whereClause = "";

    if (searchFilter) {
      const keys = Object.keys(searchFilter);
      const { title, minSalary, hasEquity } = searchFilter;

      if (title !== undefined) {
        values.push(title);
        query.push(`title ILIKE $${values.length}`);
      }

      if (minSalary !== undefined) {
        values.push(minSalary);
        query.push(`salary >= $${values.length}`);
      }

      if (hasEquity === true) {
        query.push(`equity > 0`);
      }

      if (keys.length > 1) {
        whereClause = `WHERE ${query.join(" AND ")}`;
      } else if (keys.length > 0) {
        whereClause = `WHERE ${query[0]}`;
      }
    }

    return {
      whereClause,
      values,
    };
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */
  // Part 4
  static async findAll(searchFilter) {
    const { whereClause, values } = this.constructWhereClause(searchFilter);
    const jobsRes = await db.query(
      `SELECT id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"
          FROM jobs
          ${whereClause}
          ORDER BY id`,
      values
    );

    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *   where company is [ { ...} ]
   *
   * Throws NotFoundError if not found.
   **/

   static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, companyHandle, equity}
   *
   * Returns {id, title, salary, companyHandle, equity}
   *
   * Throws NotFoundError if not found.
   */

   static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, { });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE jobs
      SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;



