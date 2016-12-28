'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Compiler = /** @type {function(new:Compiler): undefined} */ (require('./Compiler.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var ClosureCompiler = /** @type {function(new:ClosureCompiler): undefined} */ (require('./ClosureCompiler.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var CCCache = /** @type {function(new:CCCache, string): undefined} */ (require('./CCCache.js'));

/**
 * The constructor function for {@link CachingCompiler}.
 *
 * @classdesc This class is wrapper for the Google Closure Compiler that additionaly caches previous results. In case a
 *            cached result is available no compilation is required otheriwse the Google Closure Compiler is used to
 *            generate the sources. Finally the JavaScript code is returned as a result.
 *
 * @constructor
 *
 * @extends Compiler
 *
 * @param {!string} cacheFolder A folder path where CCBuild stores all cached content.
 */
function CachingCompiler (cacheFolder) {
    this._closureCompiler = new ClosureCompiler();
    this._cache = new CCCache(cacheFolder);
}

util.inherits(CachingCompiler, Compiler);

/**
 * Compiles a compilation unit and returns the JavaScript code as result. In case a cached result is available no
 * compilation is required otheriwse the Google Closure Compiler is used to generate the sources. Finally the JavaScript
 * code is returned as a result.
 *
 * @override
 *
 * @returns {QPromise<CompilationResult>} A promise holding the compilation result.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the current compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 */
CachingCompiler.prototype.compile = function (compilationUnit) {
    var self = this;
    var compilationResult;
    return this._cache.get(compilationUnit)
        .catch(function (err) {
            self._closureCompiler.compile(compilationUnit)
                .then(function (_compilationResult) {
                    compilationResult = _compilationResult;
                })
                .then(function () {
                    return self._cache.write(compilationResult);
                })
                .then(function () {
                    return self._cache.persist();
                })
                .then(function () {
                    return compilationResult;
                });
        });
};

module.exports = CachingCompiler;
