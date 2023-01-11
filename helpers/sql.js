const { BadRequestError } = require("../expressError");

/**
 * Part 1.
 * @param {*} object with data to update with
 * @param {*} object with headers to use
 * @returns object with headers to set and values to input
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Takes in optional search filter for name, minEmployees and maxEmployees
 * Returns obj with sql where clause and list of values for each search query.
 */
function constructWhereClause(searchFilter) {
  const query = [];
  const values = [];
  let whereClauses = "";

  console.log("searchFilter", searchFilter);

  if (searchFilter) {
    console.log("true", true);
    const keys = Object.keys(searchFilter);
    const { name, minEmployees, maxEmployees } = searchFilter;

    if (name !== undefined) {
      values.push(name);
      query.push(`name ILIKE $${keys.indexOf("name") + 1}`);
    }

    if (minEmployees !== undefined) {
      values.push(minEmployees);
      query.push(`num_employees >= $${keys.indexOf("minEmployees") + 1}`);
    }

    if (maxEmployees !== undefined) {
      values.push(maxEmployees);
      query.push(`num_employees <= $${keys.indexOf("maxEmployees") + 1}`);
    }

    if (query) {
      if (keys.length >= 1) {
        whereClauses = `WHERE ${query.join(" AND ")}`;
      } else if (keys.length > 0) {
        whereClauses = `WHERE ${query.join(" ")}`;
      }
    }
  }
  return {
    whereClauses,
    values,
  };
}

module.exports = { sqlForPartialUpdate, constructWhereClause };
