"use strict";

describe("schema", () => {
    var cwd, invalidSchemaDir, path, process, schemaDir, tv4;

    schemaDir = `${__dirname}/../schema`;
    invalidSchemaDir = `${__dirname}/../invalid-schema`;
    path = require("path");
    process = require("process");
    cwd = process.cwd();

    /**
     * This function exists because if there if tv4 cannot find
     * the schema you try to validate against, it will pass
     * validation anyway.
     *
     * @param {Object} value
     * @param {Object} schema
     */
    function expectValid(value, schema) {
        var result;

        result = tv4.validateResult(value, schema);
        expect(result.missing).toEqual([], `Found missing schemas. These schemas exist: ${tv4.getSchemaUris()}`);
        expect(result.valid).toBe(true);
    }

    beforeEach(() => {
        tv4 = require("../../lib")(require("tv4"));
    });
    afterEach(() => {
        process.chdir(cwd);
    });
    it("correctly attaches the functions", () => {
        expect(tv4.loadSchemaFileAsync).toEqual(jasmine.any(Function));
        expect(tv4.loadSchemaFolderAsync).toEqual(jasmine.any(Function));
    });
    describe(".loadSchemaFileAsync()", () => {
        it("loads a schema with an ID and validates against it", () => {
            return tv4.loadSchemaFileAsync(`${schemaDir}/email.json`, schemaDir).then(() => {
                expectValid("someone@example.net", "/email.json");
            });
        });
        it("loads a schema which cannot be parsed", () => {
            var schemaPath;

            schemaPath = `${invalidSchemaDir}/email-parse-error.json}`;

            return tv4.loadSchemaFileAsync(schemaPath, schemaDir).then(jasmine.fail, (err) => {
                expect(err.toString()).toContain(`Unable to parse file: ${path.normalize(schemaPath)}`);
            });
        });
        it("tries to load a schema which is not present", () => {
            var schemaPath;

            schemaPath = `${schemaDir}/email-not-there.json`;

            return tv4.loadSchemaFileAsync(schemaPath, schemaDir).then(jasmine.fail, (err) => {
                expect(err.toString()).toContain(`Unable to parse file: ${path.normalize(schemaPath)}`);
            });
        });
        it("can load a relative path", () => {
            process.chdir(schemaDir);

            return tv4.loadSchemaFileAsync("email.json", ".").then(() => {
                expectValid("someone@example.net", "/email.json");
            });
        });
        it("can load without a relativeTo", () => {
            process.chdir(schemaDir);

            return tv4.loadSchemaFileAsync("email.json").then(() => {
                expectValid("someone@example.net", "/email.json");
            });
        });
    });
    describe(".loadSchemaFolderAsync()", () => {
        it("loads schemas in folder and validates against them", () => {
            return tv4.loadSchemaFolderAsync(schemaDir).then(() => {
                expectValid("someone@example.net", "/email.json");
                expectValid(5, "/number.json");
            });
        });
    });
});
