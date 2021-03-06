"use strict";

var Bluebird, globAsync, path, readFileAsync;

Bluebird = require("bluebird");
readFileAsync = Bluebird.promisify(require("fs").readFile);
globAsync = Bluebird.promisify(require("glob"));
path = require("path");


/**
 * Adds loading schemas from a single file or a directory functionality
 * to the tv4 schema validator.
 *
 * @param {tv4} tv4
 * @return {tv4} The modified tv4 instance.
 */
module.exports = (tv4) => {
    /**
     * Loads a schema from a file.
     *
     * @param {string} schemaPath The path to the schema on the filesystem.
     * @param {string} relativeTo
     * @return {Promise.<*>}
     */
    function loadSchemaFileAsync(schemaPath, relativeTo) {
        // Important if it contains ".." or ".".
        schemaPath = path.normalize(schemaPath);

        if (!relativeTo || relativeTo === ".") {
            relativeTo = "";
        } else {
            relativeTo = path.normalize(relativeTo);
        }

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
            tv4.addSchema(id, schemaObject);
        });
    }


    /**
     * Loads a directory of schemas.
     *
     * @param {string} startPath
     * @return {Promise.<*>}
     */
    function loadSchemaFolderAsync(startPath) {
        return globAsync(path.resolve(startPath, "**/*.json"), {
            strict: true,
            nodir: true
        }).then((files) => {
            return Bluebird.all(files.map((fullPath) => {
                return loadSchemaFileAsync(fullPath, startPath);
            }));
        });
    }

    // Make sure we're using a fresh tv4.
    tv4 = tv4.freshApi();

    // Attach our functions to the tv4 object.
    tv4.loadSchemaFileAsync = loadSchemaFileAsync;
    tv4.loadSchemaFolderAsync = loadSchemaFolderAsync;

    return tv4;
};
