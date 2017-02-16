"use strict";

var fs, glob, path, tv4;

fs = require("fs");
glob = require("glob");
path = require("path");
tv4 = require("tv4");

/**
 * Manages loading schemas from a single file or a directory and validation
 * for checking data against those schemas.
 *
 * The schemas should have the `id` property set so when adding them
 * to the list of schemas they can automatically be mapped.
 */
class SchemaValidator {
    /**
     * Creates an instance of SchemaValidator.
     */
    constructor() {
        this.schemasLoaded = [];
        this.tv4 = tv4.freshApi();
    }


    /**
     * Add a custom format validator.
     *
     * @param {string} format
     * @param {function} validationFunction
     */
    addFormat(format, validationFunction) {
        this.tv4.addFormat(format, validationFunction);
    }


    /**
     * Add a custom keyword validator.
     *
     * @param {any} keyword
     * @param {any} validationFunction
     */
    defineKeyword(keyword, validationFunction) {
        this.tv4.defineKeyword(keyword, validationFunction);
    }


    /**
     * Defines a custom error code.
     *
     * @param {any} codeName
     * @param {any} codeNumber
     * @param {any} defaultMessage
     */
    defineError(codeName, codeNumber, defaultMessage) {
        this.tv4.defineError(codeName, codeNumber, defaultMessage);
    }


    /**
     * Returns a list of missing schema URIs.
     *
     * @return {Array.<string>}
     */
    getMissingSchemas() {
        return this.tv4.getMissingUris();
    }


    /**
     * Loads a schema from a file and adds it to the list
     * of schemas available for validation.
     *
     * @param {string} schema
     * @param {string} relativeTo
     * @return {Promise.<*>}
     */
    loadSchemaAsync(schema, relativeTo) {
        return new Promise((resolve, reject) => {
            fs.readFile(schema, (err, data) => {
                if (err) {
                    reject(err);
                }

                return data;
            });
        }).then((contents) => {
            return JSON.parse(contents.toString("utf-8"));
        }).then(null, () => {
            throw new Error(`Unable to parse file: ${schema}`);
        }).then((schemaObject) => {
            var id;

            id = schema.replace(relativeTo, "");

            if (id.charAt(0) !== "/") {
                id = `/${id}`;
            }

            if (schemaObject.id && schemaObject.id !== id) {
                throw new Error(`Schema had wrong ID: ${schema} should have the id ${id}`);
            }

            schemaObject.id = id;
            this.tv4.addSchema(id, schemaObject);
            this.schemasLoaded[id] = true;
        });
    }


    /**
     * Loads a directory of schemas and adds them to the
     * list of schemas available for validation.
     *
     * @param {string} startPath
     * @return {Promise.<*>}
     */
    loadSchemaFolderAsync(startPath) {
        return new Promise((resolve, reject) => {
            var options;

            options = {
                strict: true,
                nodir: true
            };
            glob(path.resolve(startPath, "**/*.json"), options, (err, files) => {
                if (err) {
                    reject(err);
                }

                return files;
            });
        }).then((files) => {
            return Promise.all(files.map((fullPath) => {
                return this.loadSchemaAsync(fullPath, startPath);
            }));
        });
    }

    /**
     * Describes problems encountered during validation.
     *
     * @typedef {Object} validationProblems
     * @property {boolean} valid Always set to false.
     * @property {Array.<Object>} errors
     * @property {Array.<string>} missing
     */

    /**
     * Validates data against an available schema.
     * If the schema isn't mapped we will throw an error.
     *
     * @param {*} data
     * @param {string} schema
     * @return {(null|validationProblems)} Null if there's no error.
     * @throws {Error} When a schema is not loaded.
     */
    validate(data, schema) {
        var result;

        if (!this.schemasLoaded[schema]) {
            throw new Error(`Schema is not loaded: ${schema}`);
        }

        result = this.tv4.validateResult(data, schema);

        if (result.valid) {
            return null;
        }

        return result;
    }
}

module.exports = SchemaValidator;
