const { BadRequestError } = require("../expressError");

/**
 * Part 1.
 *
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


module.exports = { sqlForPartialUpdate };
