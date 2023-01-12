"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (!res.locals.user) throw new UnauthorizedError();
  console.log("logged in");
  return next();
}

/**
 * Middleware to use when the user logged in is an admin
 * if not, raises unauthorized */
function ensureIsAdmin(req, res, next) {
  if (!res.locals.user.isAdmin === true) throw new UnauthorizedError();
  return next();
}

/** Middleware to use when user logged in is an admin OR
 * a specific user, if not, raises unauthorized
 */
function ensureIsAdminOrSpecificUser(req, res, next) {
  const user = res.locals.user;

  if (!(user.isAdmin === true || user.username === req.params.username)) {
    throw new UnauthorizedError();
  }
  return next();
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureIsAdminOrSpecificUser,
};
