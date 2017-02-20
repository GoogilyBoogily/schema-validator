Schema Validator
================

Manages loading schemas from a single file or a directory and validation for checking data against those schemas.

[![npm version][npm-badge]][npm-link]
[![Build Status][travis-badge]][travis-link]
[![Dependencies][dependencies-badge]][dependencies-link]
[![Dev Dependencies][devdependencies-badge]][devdependencies-link]
[![codecov.io][codecov-badge]][codecov-link]


Overview
--------

Simplifies the process of adding all schemas from a folder or a single file. This [tv4](https://www.npmjs.com/package/tv4) module as the underlying schema validator. Because of this, some of tv4's functions are exposed.


Installation
------------

Use `npm` to install this package easily.

    $ npm install --save schema-validator

Alternately you may edit your `package.json` and add this to your `dependencies` object:

    {
        ...
        "dependencies": {
            ...
            "schema-validator": "*"
            ...
        }
        ...
    }


API
---

### addFormat(format, validationFunction)

Add a custom format validator. This is an exposed tv4 function.

- `format` is a string, corresponding to the "format" value in schemas.
- `validationFunction` is a function that either returns:
    - `null` (meaning no error)
    - An error string (explaining the reason for failure)


### defineError(codeName, codeNumber, defaultMessage)

Defines a custom error code. This is an exposed tv4 function.

- `codeName` is a string, all-caps underscore separated, e.g. `"MY_CUSTOM_ERROR"`
- `codeNumber` is an integer > 10000, which will be stored in `tv4.errorCodes` (e.g. `tv4.errorCodes.MY_CUSTOM_ERROR`)
- `defaultMessage` is an error message template to use (assuming translations have not been provided for this code)


### defineKeyword(keyword, validationFunction)

Add a custom keyword validator. This is an exposed tv4 function.

- `keyword` is a string, corresponding to a schema keyword.
- `validationFunction` is a function that either returns:
    - `null` (meaning no error).
    - An error string (explaining the reason for failure).
    - An error object (containing some of: `code`/`message`/`dataPath`/`schemaPath`).


### getMissingSchemas(filter)

Return an Array with schema document URIs that are used as `$ref` in known schemas but which currently have no associated schema data.

- `filter` optional RegExp to filter URIs.


### loadSchemaAsync(schemaPath, relativeTo)

Loads a schema from a file and add it to the list of schemas available for validation. Returns an empty promise when it has finished loading the schema.

- `schemaPath` is the path to the desired schema on the filesystem.
- `relativeTo` is the path on the filesystem that `schemaPath` is relative to.


### loadSchemaFolderAsync(startPath)

Loads a directory of schemas and adds them to the list of schemas available for validation. Returns an empty promise when it has finished loading the schemas in the folder.

- `startPath` is the folder containing the schemas that will be loaded.


### validate(data, schema)

Validates data against an available schema. If the schema isn't mapped this will throw an error. If there is no error, this will return `null`.

- `data` is the JSON data to validate.
- `schema` is the schema uri to validate `data` against.


License
-------

This software is licensed under a [MIT license][LICENSE] that contains additional non-advertising and patent-related clauses.  [Read full license terms][LICENSE]


[codecov-badge]: https://img.shields.io/codecov/c/github/tests-always-included/xxxxxx/master.svg
[codecov-link]: https://codecov.io/github/tests-always-included/xxxxxx?branch=master
[dependencies-badge]: https://img.shields.io/david/tests-always-included/xxxxxx.svg
[dependencies-link]: https://david-dm.org/tests-always-included/xxxxxx
[devdependencies-badge]: https://img.shields.io/david/dev/tests-always-included/xxxxxx.svg
[devdependencies-link]: https://david-dm.org/tests-always-included/xxxxxx#info=devDependencies
[LICENSE]: LICENSE.md
[npm-badge]: https://img.shields.io/npm/v/xxxxxx.svg
[npm-link]: https://npmjs.org/package/xxxxxx
[travis-badge]: https://img.shields.io/travis/tests-always-included/xxxxxx/master.svg
[travis-link]: http://travis-ci.org/tests-always-included/xxxxxx

