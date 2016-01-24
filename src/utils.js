/**
 * This module contains several utility functions for this package.
 *
 * @module utils
 */

/**
 * @private
 */
var rpj = /** @type {function(...*): Promise} */ (require('read-package-json'));

/**
 * @private
 * @suppress {duplicate}
 */
var Q = require('q');

/**
 * @private
 *
 * @suppress {duplicate}
 */
var CC = require('google-closure-compiler');

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

/**
 * Get the version of the closure compiler.
 *
 * @returns {Promise} A promise holding the version of the used Closure Compiler.
 */
function getCCVersion () {
    var deferred = Q.defer();
    var compiler = new CC.compiler(['--version']);
    compiler.run(function (code, stdout, stderr) {
        if (code !== 0 || stderr) {
            var err = new Error(code + (stderr ? ': ' + stderr : ''));
            deferred.reject(err);
        }
        deferred.resolve(stdout);
    });

    return deferred.promise;
}

/**
 * Get the help for the closure compiler.
 *
 * @returns {Promise} A promise holding the help message for the Closure Compiler.
 */
function getCCHelp () {
    var deferred = Q.defer();
    var compiler = new CC.compiler(['--help']);
    compiler.run(function (code, stdout, stderr) {
        if (code !== 0 || stderr) {
            var err = new Error(code + (stderr ? ': ' + stderr : ''));
            deferred.reject(err);
        }
        deferred.resolve(stdout);
    });

    return deferred.promise;
}

/**
 * Removes an array representing a set without duplicates.
 *
 * @template T
 * @returns {Array<T>} The new set.
 * @param {Array<T>} arr The original array.
 * @param {function(T, T): boolean=} comp An optional comparison function. If no one is set `===` is used.
 */
function arrayToSet (arr, comp) {
    var internalComp = comp;
    if (!internalComp) {
        internalComp = function (l, r) {
            return l === r;
        };
    }

    return arr.filter(function (item, index) {
        for (var i = 0; i !== index; ++i) {
            if (internalComp(arr[i], item)) return false;
        }
        return true;
    });
}

module.exports.getSelfVersion = getSelfVersion;
module.exports.getSelfName = getSelfName;
module.exports.arrayToSet = arrayToSet;
module.exports.getCCVersion = getCCVersion;
module.exports.getCCHelp = getCCHelp;
