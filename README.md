tv4 File Loader
===============

Adds loading schemas from a single file or a directory functionality to the [tv4](https://www.npmjs.com/package/tv4) schema validator.

[![npm version][npm-badge]][npm-link]
[![Build Status][travis-badge]][travis-link]
[![Dependencies][dependencies-badge]][dependencies-link]
[![Dev Dependencies][devdependencies-badge]][devdependencies-link]
[![codecov.io][codecov-badge]][codecov-link]


Overview
--------

Simplifies the process of adding all schemas from a folder or a single file by attaching the `loadSchemaFileAsync()` and `loadSchemaFolderAsync` functions to [tv4](https://www.npmjs.com/package/tv4).


Installation
------------

Use `npm` to install this package easily.

    $ npm install --save tv4-file-loader

Alternately you may edit your `package.json` and add this to your `dependencies` object:

    {
        ...
        "dependencies": {
            ...
            "tv4-file-loader": "*"
            ...
        }
        ...
    }


Functions attached to tv4
-------------------------

### `loadSchemaFileAsync(schemaPath, relativeTo)`

Loads a schema from a file. Returns an empty promise when it has finished loading the schema.

- `schemaPath` is the path to the desired schema on the filesystem.
- `relativeTo` is the path on the filesystem that `schemaPath` is relative to.


### `loadSchemaFolderAsync(startPath)`

Loads a directory of schemas. Returns an empty promise when it has finished loading the schemas in the folder.

- `startPath` is the folder containing the schemas that will be loaded.


Usage
-----

First, require tv4.

    var tv4;

    tv4 = require("tv4");

Then, require the tv4-file-loader module and pass the newly created tv4 into it.

    require("tv4-file-loader")(tv4);

Voila! Now you have the `loadSchemaFileAsync()` and `loadSchemaFolderAsync()` functions available to you through tv4. You can use them like so:

    tv4.loadSchemaFileAsync("./schemas/example-schema.json", ".");
    tv4.loadSchemaFolderAsync("./anotherSchemaFolder/");


License
-------

This software is licensed under a [MIT license][LICENSE] that contains additional non-advertising and patent-related clauses. [Read full license terms][LICENSE]


[codecov-badge]: https://img.shields.io/codecov/c/github/connected-world-services/tv4-file-loader/master.svg
[codecov-link]: https://codecov.io/github/connected-world-services/tv4-file-loader?branch=master
[dependencies-badge]: https://img.shields.io/david/connected-world-services/tv4-file-loader.svg
[dependencies-link]: https://david-dm.org/connected-world-services/tv4-file-loader
[devdependencies-badge]: https://img.shields.io/david/dev/connected-world-services/tv4-file-loader.svg
[devdependencies-link]: https://david-dm.org/connected-world-services/tv4-file-loader#info=devDependencies
[LICENSE]: LICENSE.md
[npm-badge]: https://img.shields.io/npm/v/tv4-file-loader.svg
[npm-link]: https://npmjs.org/package/tv4-file-loader
[travis-badge]: https://img.shields.io/travis/connected-world-services/tv4-file-loader/master.svg
[travis-link]: http://travis-ci.org/connected-world-services/tv4-file-loader

