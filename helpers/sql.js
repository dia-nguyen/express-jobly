const { BadRequestError } = require("../expressError");

/**
 * Part 1.
 *
 * description
 *  - Helper function to build prepared statements for SET clause
 *    for SQL statement to update database.
 *
 * dataToUpdate should be {firstName: value1, lastName: value2,...}
 * jsToSql should be { firstName: "first_name", lastName: "last_name",...};
 *
 * Returns {
      setCols: '"first_name"=$1, "last_name"=$2,...
      values: [value1, value2,...],
    }
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
  let whereClause = "";


  if (searchFilter) {

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
        whereClause = `WHERE ${query.join(" AND ")}`;
      } else if (keys.length > 0) {
        whereClause = `WHERE ${query.join(" ")}`;
      }
    }
  }
  return {
    whereClause,
    values,
  };
}

module.exports = { sqlForPartialUpdate, constructWhereClause };
