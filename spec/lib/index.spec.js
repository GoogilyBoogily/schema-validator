"use strict";

describe("schema", () => {
    var mock, path, tv4;

    beforeEach(() => {
        var fs;

        fs = require("fs");
        mock = require("mock-require");
        path = require("path");
        spyOn(path, "resolve").and.callThrough();
        tv4 = require("tv4");
        spyOn(tv4, "addSchema").and.callThrough();
        spyOn(fs, "readFile").and.callFake((fn, callback) => {
            /**
             * Signify the end of the loading of a file.  If passed a string,
             * uses that string as a buffer.  If passed an object, first it
             * converts the object to a JSON string and then passes back the
             * string as a buffer.
             *
             * @param {(string|Object)} obj
             */
            function done(obj) {
                if (typeof obj !== "string") {
                    obj = JSON.stringify(obj);
                }

                callback(null, new Buffer(obj, "binary"));
            }

            if (fn.match("email.json")) {
                // No id in this file
                done({
                    type: "string",
                    format: "email"
                });

                return;
            }

            if (fn.match("number.json")) {
                // ID in this file
                done({
                    id: "/folder/folder/number.json",
                    type: "number",
                    minimum: 5
                });

                return;
            }

            if (fn.match("email-parse-error.json")) {
                done("{\"type: \"string\", \"format\": \"email\"}");

                return;
            }

            if (fn.match("missing-one.json")) {
                done({
                    type: "object",
                    properties: {
                        a: {
                            $ref: "/other-schema"
                        }
                    }
                });

                return;
            }

            callback(new Error(`Invalid file: ${fn.toString()}`));
        });
        mock("glob", (pattern, options, callback) => {
            expect(pattern).toBe("./folder/**/*.json");
            expect(options).toEqual({
                strict: true,
                nodir: true
            });

            callback(null, [
                "/folder/email.json",
                "/folder/folder/number.json"
            ]);
        });
        tv4 = mock.reRequire("../..")(tv4);
    });
    it("correctly attaches the functions", () => {
        expect(tv4.loadSchemaFileAsync).toEqual(jasmine.any(Function));
        expect(tv4.loadSchemaFolderAsync).toEqual(jasmine.any(Function));
    });
    describe(".loadSchemaFileAsync()", () => {
        it("loads a schema with an ID and validates against it", () => {
            return tv4.loadSchemaFileAsync("./email.json", "./").then(() => {
                expect(tv4.validate("someone@example.net", "/email.json")).toBe(true);
            });
        });
        it("loads a schema which cannot be parsed", () => {
            return tv4.loadSchemaFileAsync("./email-parse-error.json", "./").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Unable to parse file: ./email-parse-error.json");
            });
        });
        it("tries to load a schema which is not present", () => {
            return tv4.loadSchemaFileAsync("./email-not-there.json", "./").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Unable to parse file: ./email-not-there.json");
            });
        });
    });
    describe(".loadSchemaFolderAsync()", () => {
        it("loads schemas in folder and validates against them", () => {
            path.resolve.and.callFake((a, b) => {
                return a + b;
            });

            return tv4.loadSchemaFolderAsync("./folder/").then(() => {
                expect(tv4.validate("someone@example.net", "/folder/email.json")).toBe(true);
                expect(tv4.validate(5, "/folder/folder/number.json")).toBe(true);
            });
        });
    });
});
