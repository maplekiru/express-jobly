const { BadRequestError } = require("../expressError");



/** Given two objects: first one's keys in camel case format and values to be updated to db.
and second one keys in keys in camel case format and corresponding values in SQL formating.

Input(dataToUpdate, jsToSql)
dataToUpdate---->>{firstName: 'Aliya', age: 32}
jsToSql---->>{firstName:first_name}

Returns {setCols, values} 
setCols ----> ' "first_name"=$1','"age"=$2',....
values ----> [Aliya, 32, .....]

Throws bad request error if dataToUpdate is empty.
 **/


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}





module.exports = { sqlForPartialUpdate };
