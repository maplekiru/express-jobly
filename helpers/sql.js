const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/** Given two objects: first one's keys in camel case format and values to be updated to db.
and second one keys in keys in camel case format and corresponding values in SQL formating.
accepts {JS keyname: updated value, ....}, { JS keyname: "SQL column name",......}.
 
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

/** Given two objects: first one's keys in camel case format and values to filter by in db.
and second one keys in keys in camel case format and corresponding values is column name in SQL db.
accepts {JS keyname: filter value, ....}, { JS keyname: "SQL column name",......}.
  
Returns {whereCols, values}

whereCols ----> '"name"=$1', AND '"num_employees">$2',....
values ----> [Mitchell, 32, .....]

Throws bad request error if dataToFilter is empty or minEmployees is greater than maxEmployees.
**/

function sqlForFiltering(dataToFilter, jsToSql) {
  const keys = Object.keys(dataToFilter);
  if (keys.length === 0) throw new BadRequestError("No data");
  if (+dataToFilter.minEmployees > +dataToFilter.maxEmployees) {
    throw new BadRequestError("Min employees can't be greater than max employees");
  }
  // {name: 'Mitchell', num_employees } => ['"name"=$1', '"age"=$2']
  // const cols = keys.map((colName, idx) =>
  //     `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  // );
  const cols = [];
  const values= []
  for (let i = 0; i < keys.length; i++) {
    let colName = keys[i];
    if (colName === 'name') {
      // cols.push(`"${jsToSql[colName] || colName}" ILIKE "%$${i+ 1}%"`);
      cols.push(`name ILIKE $${i + 1}`)
      values.push(`%${dataToFilter[colName]}%`)
    }
    if (colName === 'minEmployees') {
      cols.push(`"${jsToSql[colName] || colName}">$${i + 1}`);
      values.push(`${dataToFilter[colName]}`)
    }
    if (colName === 'maxEmployees') {
      cols.push(`"${jsToSql[colName] || colName}"<$${i + 1}`);
      values.push(`${dataToFilter[colName]}`)
    }
  }
  console.log('values', values)
  return {
    whereCols: cols.join(' AND '),
    values:values
  };
}

module.exports = { sqlForPartialUpdate, sqlForFiltering };
