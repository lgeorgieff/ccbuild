'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var NotFoundInCacheError = /** @type {function (new:NotFoundInCacheError, string, string, string): undefined}*/
    (require('./NotFoundInCacheError.js'));

/**
 * The constructor function for {@link CCCache}.
 *
 * @classdesc This class is responsible for caching compilation units.
 *
 * @constructor
 *
 * @param {!string} cacheFolder A folder path where CCBuild stores all cached content.
 * @throws {Error} Thrown if cacheFolder is not a string or empty.
 */
function CCCache (cacheFolder) { }

/**
 * Tries to get a cached compilation result. In case there is nothing cached yet for the given compilation unit or the
 * data held in the cache is outdated, an error is returned.
 *
 * @returns {QPromise<Object>} A promise holding the cached compilation result. In case the requested compilation unit
 *          is not cached the promise is rejected with a {@link NotFoundInCacheError}.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the current compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 * @throws {Error} Thrown if the access to the cache failed.
 */
CCCache.prototype.get = function (compilationUnit) {
    return null;
};

/**
 * Write the generated JavaScript code into the cache. In case the compilaton unit is already cached it will be
 * overwritten.
 *
 * @returns {QPromise<Object>} A promise holding the cached compilation result. In case the requested compilation unit
 *          is not cached the promise is rejected with a {@link NotFoundInCacheError}.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the requested compilation unit.
 * @param {Object} compilationResult The result of the Google Closure Compiler that will be cached.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 * @throws {Error} Thrown if the access to the cache failed.
 */
CCCache.prototype.write = function (compilationUnit, compilationResult) {
    return null;
};

/**
 * Write the generated JavaScript code into the cache. In case the compilaton unit is already cached it will be
 * overwritten.
 *
 * @private
 *
 * @returns {QPromise<Object>} A promise holding the cached compilation result. In case the requested compilation unit
 *          is not cached the promise is rejected with a {@link NotFoundInCacheError}.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the requested compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 * @throws {Error} Thrown if the access to the cache failed.
 * @throws {NotFoundInCacheError} Thrown if no result is found in the cache for the requested compilation unit.
 */
CCCache.prototype._cleanCache = function (compilationUnit) {
    return null;
};

/**
 * Generate a hash for a compilation unit. This has may be used to analyze whether a compilation unit was updated.
 *
 * @private
 *
 * @returns {QPromise<string>} A promise holding the hash that represents the passed compilation unit.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the requested compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 * @throws {Error} Thrown if file access failed.
 */
CCCache.prototype._generateHash = function (compilationUnit) {
    // A compilation unit is hashed by the following process
    // - unitName: is ignored
    // - globalSources: file contents are hashed
    // - unitSources: file contents are hashed
    // - globalExterns: file contents are hashed
    //   - flagfile: file content is hashed
    // - unitExterns: file contents are hashed
    //   - flagfile: file content is hashed
    // - globalBuildOptions: values are hashed
    // - unitBuildOptions: values are hashed
    // - outputFile: value is hashed
    // - unitWarningsFilterFile: file content are hashed
    // - globalWarningsFilterFile: file content are hashed
    return null;
};

/**
 * Get the result for a compilation unit form the cached data.
 *
 * @private
 *
 * @returns {QPromise<Object>} A promise holding the cached compilation result. In case the requested compilation unit
 *          is not cached the promise is rejected with a {@link NotFoundInCacheError}.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the requested compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 * @throws {Error} Thrown if the access to the cache failed.
 * @throws {NotFoundInCacheError} Thrown if no result is found in the cache for the requested compilation unit.
 */
CCCache.prototype._getCachedResult = function (compilationUnit) {
    return null;
};

module.exports = CCCache;
