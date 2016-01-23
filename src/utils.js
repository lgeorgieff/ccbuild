/**
 * This module contains several utility functions for this package.
 *
 * @module utils
 */

/**
 * @private
 *
 * @const
 */
var rpj = require('read-package-json');

/**
 * @private
 *
 * @const
 */
var Q = require('q');

/**
 * @private
 *
 * @returns {Promise}
 * @param {string} propertyName
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

module.exports.getSelfVersion = getSelfVersion;
