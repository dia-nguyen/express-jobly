"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { sqlForPartialUpdate } = require("../helpers/sql")

describe("Sql Partial Update", function(){
  test("bad request if no data", function() {
    try {
      sqlForPartialUpdate({}, {});
      // throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  })
})