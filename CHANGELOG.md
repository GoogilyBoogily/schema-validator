CHANGELOG
=========

1.0.4 - 2017-04-06
------------------

* Fixing problem with loading a relative path. If your path had a ".." or "." in it anywhere it would not fix the schema name (id) properly.


1.0.3 - 2017-02-24
------------------

* Now, before attaching the functions to tv4, we get a fresh tv4 instance (via tv4's `freshApi()` function).
* Changed the promisifying method (from `promisifyAll()` to `promisify()`), as it wasn't working in some cases.


1.0.2 - 2017-02-22
------------------

* The factory now returns the instance of tv4 for ease of use with Dizzy and possibly other module loaders.


1.0.1 - 2017-02-22
------------------

* Updating documentation to be more explicit about what each function returns.


1.0.0 - 2017-02-22
------------------

* Initial release.
