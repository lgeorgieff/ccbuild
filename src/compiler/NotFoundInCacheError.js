'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * The constructor function for {@link NotFoundInCacheError}.
 *
 * @classdesc This class represents an error that is thrown by the compilation cache {@link CCCache}.
 *
 * @constructor
 *
 * @extends Error
 *
 * @param {string} compilationUnitName The name of the compilation unit.
 * @param {string} compilationUnitHash The hash of the compilation unit.
 * @param {string} cacheFolderLocation The folder of the compilation cache.
 */
function NotFoundInCacheError (compilationUnitName, compilationUnitHash, cacheFolderLocation) {
    Error();
    this._compilationUnitName = compilationUnitName;
    this._compilationUnitHash = compilationUnitHash;
    this._cacheFolderLocation = cacheFolderLocation;
}

util.inherits(NotFoundInCacheError, Error);

/**
 * A getter for the compilation unit name that is in the context of this error.
 *
 * @returns {string} The name of the compilation unit.
 */
NotFoundInCacheError.prototype.getCompilationUnitName = function () {
    return this._compilationUnitName;
};

/**
 * A getter for the compilation unit hash that is in the context of this error.
 *
 * @returns {string} The name of the compilation unit.
 */
NotFoundInCacheError.prototype.getCompilationUnitHash = function () {
    return this._compilationUnitHash;
};

/**
 * A getter for the cache folder location that is in the context of this error.
 *
 * @returns {string} The name of the compilation unit.
 */
NotFoundInCacheError.prototype.getCacheFolderLocation = function () {
    return this._cacheFolderLocation;
};

module.exports = NotFoundInCacheError;
