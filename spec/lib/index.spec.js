"use strict";

describe("schema", () => {
    var Bluebird, mock, path, SchemaValidator, schemaValidatorInstance;

    beforeEach(() => {
        var fs, tv4;

        Bluebird = require("bluebird");
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
        mock("glob", (pattern, options) => {
            expect(pattern).toBe("./folder/**/*.json");
            expect(options).toEqual({
                strict: true,
                nodir: true
            });

            return Bluebird.resolve([
                "/folder/email.json",
                "/folder/folder/number.json"
            ]);
        });
        SchemaValidator = require("../..");
        schemaValidatorInstance = new SchemaValidator();
    });
    describe(".addFormat()", () => {
        it("correctly adds schema to tv4's schema cache", () => {
            var testSchema;

            testSchema = {
                type: "string",
                format: "testFormat"
            };

            schemaValidatorInstance.addFormat("testFormat", (data) => {
                if (data === "testData") {
                    return true;
                }

                return "Incorrect test data";
            });

            expect(schemaValidatorInstance.tv4.validate("testData", testSchema)).toBe(true);
            expect(schemaValidatorInstance.tv4.validate("notTestData", testSchema)).toBe(false);
        });
    });
    describe(".defineError()", () => {
        it("correctly adds a custom error to tv4's errorCodes property", () => {
            schemaValidatorInstance.defineError("MY_CUSTOM_ERROR", 10001, "Incorrect moon (expected {expected}, got {actual}");
            expect(schemaValidatorInstance.tv4.errorCodes.MY_CUSTOM_ERROR).toBe(10001);
        });
    });
    describe(".defineKeyword()", () => {
        it("correctly adds a custom keyword validator", () => {
            var customKeywordValue, customKeywordValueTwo, invalidCustomKeywordText, testData, testDataTwo;

            customKeywordValue = "Custom keyword value.";
            customKeywordValueTwo = "Wrong custom keyword value.";
            invalidCustomKeywordText = "Invalid custom keyword value.";
            testData = {
                myCustomKeyword: customKeywordValue
            };
            testDataTwo = {
                myCustomKeyword: customKeywordValueTwo
            };
            schemaValidatorInstance.defineKeyword("myCustomKeyword", (data, value) => {
                if (value === data.myCustomKeyword) {
                    return null;
                }

                return invalidCustomKeywordText;
            });
            schemaValidatorInstance.tv4.addSchema("/", {
                myCustomKeyword: customKeywordValue
            });
            expect(schemaValidatorInstance.tv4.validate(testData, "/")).toBe(true);
            expect(schemaValidatorInstance.tv4.validate(testDataTwo, "/")).toBe(false);
        });
    });
    describe(".getMissingSchemas()", () => {
        it("reports on missing schemas", () => {
            return schemaValidatorInstance.loadSchemaAsync("./missing-one.json", "./").then(() => {
                expect(schemaValidatorInstance.getMissingSchemas()).toEqual([
                    "/other-schema"
                ]);
            });
        });
    });
    describe(".loadSchemaAsync()", () => {
        it("loads a schema with an ID and validates against it", () => {
            return schemaValidatorInstance.loadSchemaAsync("./email.json", "./").then(() => {
                expect(() => {
                    schemaValidatorInstance.validate("someone@example.net", "/email.json");
                }).not.toThrow();
            });
        });
        it("loads a schema which cannot be parsed", () => {
            return schemaValidatorInstance.loadSchemaAsync("./email-parse-error.json", "./").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Unable to parse file: ./email-parse-error.json");
            });
        });
        it("tries to load a schema which is not present", () => {
            return schemaValidatorInstance.loadSchemaAsync("./email-not-there.json", "./").then(jasmine.fail, (err) => {
                expect(err.toString()).toContain("Unable to parse file: ./email-not-there.json");
            });
        });
    });
    describe(".loadSchemaFolderAsync()", () => {
        it("loads schemas in folder and validates against them", () => {
            path.resolve.and.callFake((a, b) => {
                return a + b;
            });

            return schemaValidatorInstance.loadSchemaFolderAsync("./folder/").then(() => {
                var result;

                expect(() => {
                    result = schemaValidatorInstance.validate("someone@example.net", "/folder/email.json");
                }).not.toThrow();
                expect(result).toBe(null);
                expect(() => {
                    result = schemaValidatorInstance.validate(5, "/folder/folder/number.json");
                }).not.toThrow();
                expect(result).toBe(null);
            });
        });
    });
    describe(".validate()", () => {
        it("loads a schema and passes validation", () => {
            return schemaValidatorInstance.loadSchemaAsync("./email.json", "./").then(() => {
                var result;

                expect(() => {
                    result = schemaValidatorInstance.validate("someone@example.net", "/email.json");
                }).not.toThrow();
                expect(result).toBe(null);
            });
        });
        it("loads a schema and fails validation", () => {
            return schemaValidatorInstance.loadSchemaAsync("./email.json", "./").then(() => {
                var result;

                result = schemaValidatorInstance.validate(5, "/email.json");
                expect(result).not.toBe(null);
                expect(result).toEqual(jasmine.any(Object));
            });
        });
        it("tries to validate against a non-present schema", () => {
            expect(() => {
                schemaValidatorInstance.validate("something", "notThere");
            }).toThrowError("Schema is not loaded: notThere");
        });
    });
});

