"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

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
           RETURNING it, title, salary, equity, company_handle AS "companyHandle"`,
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
        values.push(hasEquity);
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

  /** Find all companies.
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
                company_handle AS "companyHandle",
          FROM jobs
          ${whereClause}
          ORDER BY id`,
      values
    );

    return jobsRes.rows;
  }

  /** Given a job handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

   static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }





}


