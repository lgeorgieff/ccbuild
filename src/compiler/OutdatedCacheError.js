'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * The constructor function for {@link OutdatedCacheError}.
 *
 * @classdesc This class represents an error that is thrown by the compilation cache {@link CCCache}.
 *
 * @constructor
 *
 * @extends Error
 *
 * @param {string} compilationUnitName The name of the compilation unit.
 * @param {string} outdatedCompilationUnitHash The outdated hash of the compilation unit.
 * @param {string} validCompilationUnitHash The currently valid hash of the compilation unit.
 * @param {string} cacheFolderLocation The folder of the compilation cache.
 */
function OutdatedCacheError (compilationUnitName, outdatedCompilationUnitHash, validCompilationUnitHash,
                             cacheFolderLocation) {
    Error();
    this._compilationUnitName = compilationUnitName;
    this._outdatedCompilationUnitHash = outdatedCompilationUnitHash;
    this._validCompilationUnitHash = validCompilationUnitHash;
    this._cacheFolderLocation = cacheFolderLocation;
}

util.inherits(OutdatedCacheError, Error);

/**
 * A getter for the compilation unit name that is in the context of this error.
 *
 * @returns {string} The name of the compilation unit.
 */
OutdatedCacheError.prototype.getCompilationUnitName = function () {
    return this._compilationUnitName;
};

/**
 * A getter for the outdated compilation unit hash that is in the context of this error.
 *
 * @returns {string} The name of the compilation unit.
 */
OutdatedCacheError.prototype.getOutdatedCompilationUnitHash = function () {
    return this._outdatedCompilationUnitHash;
};

/**
 * A getter for the outdated compilation unit hash that is in the context of this error.
 *
 * @returns {string} The name of the compilation unit.
 */
OutdatedCacheError.prototype.getValidCompilationUnitHash = function () {
    return this._validCompilationUnitHash;
};

/**
 * A getter for the cache folder location that is in the context of this error.
 *
 * @returns {string} The name of the compilation unit.
 */
OutdatedCacheError.prototype.getCacheFolderLocation = function () {
    return this._cacheFolderLocation;
};

module.exports = OutdatedCacheError;
