'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var fs = require('fs');

/**
 * @ignore
 * @suppress {duplicate}
 */
var mkdirp = require('mkdirp');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Q = require('q');

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
    return this._createCacheFolderIfRequired()
        .then(function () {
            return self._cache.get(compilationUnit);
        })
        .catch(function (err) {
            return self._closureCompiler.compile(compilationUnit)
                .then(function (_compilationResult) {
                    compilationResult = _compilationResult;
                })
                .then(function () {
                    return self._cache.write(compilationUnit, compilationResult)
                        .then(function () {
                            return self._cache.persist();
                        })
                        .then(function () {
                            return compilationResult;
                        })
                        .catch(function (err) {
                            return compilationResult;
                        });
                });
        });
};

/**
 * Create the cache folder in case it does not exist yet.
 *
 * @private
 *
 * @returns {QPromise} A resolved promise in case the cache folder was created successful or did already exist.
 *                     A rejected promise holding an error object in case the cache folder could not be created.
 */
CachingCompiler.prototype._createCacheFolderIfRequired = function () {
    var self = this;
    var deferred = Q.defer();
    mkdirp(this._cache.getCacheFolder(), {mode: 0o775}, function (errMkdirp) {
        if (errMkdirp && errMkdirp.code === 'EEXIST') {
            fs.stat(self._cache.getCacheFolder(), function (errStat, stats) {
                if (errStat) {
                    deferred.reject(errStat);
                } else {
                    if (!stats.isDirectory()) {
                        deferred.reject(new Error('The cache folder ' + self._cache.getCacheFolder() + ' is not a ' +
                                                  'directory'));
                    } else {
                        fs.access(self._cache.getCacheFolder(), fs.R_OK | fs.W_OK | fs.X_OK, function (errAccess) {
                            if (errAccess) {
                                deferred.reject(errAccess);
                            } else {
                                deferred.resolve();
                            }
                        });
                    }
                }
            });
        } else if (errMkdirp) {
            deferred.reject(errMkdirp);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
};

module.exports = CachingCompiler;
