"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { sqlForPartialUpdate } = require("../helpers/sql");
// Part 1
describe("Sql Partial Update", function () {
  test("bad request if no data", function () {
    try {
      sqlForPartialUpdate({},{});
      // throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("testing for valid data", function () {
    const updateData = {
      firstName: "NewF",
      lastName: "NewF",
      email: "new@email.com",
      isAdmin: true,
    };
    const jsToUpdate = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    const updatedData = sqlForPartialUpdate(updateData, jsToUpdate);
    expect(updatedData).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4',
      values: ["NewF", "NewF", "new@email.com", true],
    });
  });
});
