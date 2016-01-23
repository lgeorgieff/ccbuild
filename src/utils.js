/**
 * This module contains several utility functions for this package.
 *
 * @module utils
 */

/**
 * @private
 */
var rpj = require('read-package-json');

/**
 * @private
 * @suppress {duplicate}
 */
var Q = require('q');

/**
 * Read a property of this package's package.json file.
 *
 * @private
 *
 * @returns {Promise} A promise that holds the read value.
 * @param {string} propertyName The property name that is read in package.json.
 */
function getPropertyValueFromPackageJson (propertyName) {
    var deferred = Q.defer();
    rpj('./package.json', function (err, data) {
        if (err) deferred.reject(err);
        else deferred.resolve(data[propertyName]);
    });
    return deferred.promise;
}

/**
 * Get the version defined in package.json.
 *
 * @returns {Promise} A promise holding the version of this app's package.json file.
 */
function getSelfVersion () {
    return getPropertyValueFromPackageJson ('version');
}

/**
 * Get the name defined in package.json.
 *
 * @returns {Promise} A promise holding the version of this app's package.json file.
 */
function getSelfName () {
    return getPropertyValueFromPackageJson ('name');
}

module.exports.getSelfVersion = getSelfVersion;
module.exports.getSelfName = getSelfName;
