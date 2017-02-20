"use strict";

var Bluebird, globAsync, path, readFileAsync, tv4;

Bluebird = require("bluebird");
readFileAsync = Bluebird.promisify(require("fs").readFile);
globAsync = Bluebird.promisifyAll(require("glob"));
path = require("path");
tv4 = require("tv4");


/**
 * Describes problems encountered during validation.
 *
 * @typedef {Object} validationProblems
 * @property {boolean} valid Always set to false.
 * @property {Array.<Object>} errors
 * @property {Array.<string>} missing
 */


/**
 * Manages loading schemas from a single file or a directory and validation
 * for checking data against those schemas.
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
     * Defines a custom error code.
     *
     * @param {string} codeName
     * @param {int} codeNumber
     * @param {string} defaultMessage
     */
    defineError(codeName, codeNumber, defaultMessage) {
        this.tv4.defineError(codeName, codeNumber, defaultMessage);
    }


    /**
     * Add a custom keyword validator.
     *
     * @param {string} keyword
     * @param {function} validationFunction
     */
    defineKeyword(keyword, validationFunction) {
        this.tv4.defineKeyword(keyword, validationFunction);
    }


    /**
     * Returns a list of missing schema URIs.
     *
     * @param {RegExp} [filter=false] Optional RegExp to filter URIs.
     * @return {Array.<string>}
     */
    getMissingSchemas(filter) {
        return this.tv4.getMissingUris(filter);
    }


    /**
     * Loads a schema from a file and adds it to the list
     * of schemas available for validation.
     *
     * @param {string} schemaPath The path to the schema on the filesystem.
     * @param {string} relativeTo
     * @return {Promise.<*>}
     */
    loadSchemaAsync(schemaPath, relativeTo) {
        return readFileAsync(schemaPath).then((contents) => {
            return JSON.parse(contents.toString("utf-8"));
        }).then(null, () => {
            throw new Error(`Unable to parse file: ${schemaPath}`);
        }).then((schemaObject) => {
            var id;

            id = schemaPath.replace(relativeTo, "");

            if (id.charAt(0) !== "/") {
                id = `/${id}`;
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
        return globAsync(path.resolve(startPath, "**/*.json"), {
            strict: true,
            nodir: true
        }).then((files) => {
            return Bluebird.all(files.map((fullPath) => {
                return this.loadSchemaAsync(fullPath, startPath);
            }));
        });
    }


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
