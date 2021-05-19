const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

describe("test sqlForPartialUpdate", function () {
    test("valid inputs", function () {
        const dataToUpdate = { firstName: 'test1', lastName: "test2" }
        const jsToSql = { firstName: "first_name", lastName: "last_name" }
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);


        expect(result).toEqual({
            setCols: '"first_name"=$1, "last_name"=$2',
            values: ["test1", "test2"]
        });
    });

    test("Invalid dataToUpdate inputs", function () {
        const dataToUpdate = {}
        const jsToSql = { firstName: "first_name", lastName: "last_name" }
        try {
            const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("missing jsSql keyValue pair", function () {
        const dataToUpdate = { firstName: 'test1', lastName: "test2" }
        const jsToSql = {lastName: "last_name" }
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);


        expect(result).toEqual({
            setCols: '"firstName"=$1, "last_name"=$2',
            values: ["test1", "test2"]
        });
    });

});
