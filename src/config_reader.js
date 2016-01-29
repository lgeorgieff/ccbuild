'use strict';

/**
 * This module contains several functions for getting and parsing the configuration files for this app.
 *
 * @module config_reader
 */

/**
 * @private
 *
 * @suppress {duplicate}
 */
var fs = require('fs');

/**
 * @private
 *
 * @suppress {duplicate}
 */
var path = require('path');

/**
 * @private
 *
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * @private
 *
 * @suppress {duplicate}
 */
var Q = require('q');

/**
 * @private
 *
 * @suppress {duplicate}
 */
var utils = require('./utils');

/**
 * @type {string}
 * @const
 */
var DEFAULT_CONFIG_EXTENSION = '.nbuild';

/**
 * Get the paths for all local config files.
 *
 * @return {Promise<Array<string>>} A promise that holds an array of strings.
 *
 * @suppress {visibility}
 */
function getLocalConfigFiles () {
    var deferred = Q.defer();
    fs.readdir('.', function (err, fileNames) {
        var configPromises = fileNames.map(function (fileName) {
            var configDeferred = Q.defer();
            if (fileName.endsWith(DEFAULT_CONFIG_EXTENSION)) {
                var absolutePath = path.resolve(fileName);
                fs.stat(absolutePath, function (err, stats) {
                    if (err) configDeferred.reject(err);
                    else if (stats.isFile()) configDeferred.resolve(absolutePath);
                    else configDeferred.resolve(undefined);
                });
                return configDeferred.promise;
            } else {
                return configDeferred.resolve(undefined);
            }
        });

        Q.allSettled(configPromises).then(function (configPaths) {
            var errorReason;
            var configFiles = utils.arrayToSet(configPaths.filter(function (configPathPromise) {
                if (configPathPromise.state === 'fulfilled') {
                    return configPathPromise.value !== undefined;
                } else {
                    errorReason = configPathPromise.reason;
                    return false;
                }
            }).map(function (configPathPromise) {
                return configPathPromise.value;
            }));
            if (errorReason) deferred.reject(configFiles);
            else deferred.resolve(configFiles);
        });
    });
    return deferred.promise;
}

/**
 * Constructor function for ConfigurationNormalizer.
 *
 * @constructor
 * @classdesc This class is responsible to check and normalize a configuration object.
 *
 * @param {Object=} config The loaded configuration object. If `undefined` or `null` is passed `{}` is used.
 * @param {string=} basePath The path against each relative path of the configuration is resolved.
 * @throws {Error} Thrown if `config` is not `undefined`, `null` or an object.
 */
function ConfigurationNormalizer (config, basePath) {
    if (config === undefined || config === null || util.isObject(config)) {
        this._config = config || {};
    } else {
        throw new Error('config must be of the type object|null|undefined but is ' + config + '!');
    }

    if (basePath === undefined || basePath === null) this._basePath = process.cwd();
    else this._basePath = basePath;
}

/**
 * A helper function that checks the passed argument whether it is a string array or not.
 *
 * @private
 * @static
 *
 * @returns {Array<string>} The string array in case of no error.
 * @param {*} stringArray The potential string array.
 * @param {string} propertyName The property name of the owner object of the passed string array.
 * @throws {Error} Thrown if `sringArray` is not a string array.
 *
 * @suppress {visibility}
 */
ConfigurationNormalizer._mapStringArray = function (stringArray, propertyName) {
    if (utils.isStringArray(stringArray)) {
        return /** @type {Array<string>} */ (stringArray);
    } else if (stringArray === null || stringArray === undefined) {
        return [];
    } else {
        throw new Error(propertyName + ' must be an array of file paths but is ' + stringArray + '!');
    }
};

/**
 * A helper function that checks the passed argument whether it is a boolean value or not.
 *
 * @private
 * @static
 *
 * @returns {boolean} The boolean value in case of no error.
 * @param {*} booleanValue The potential boolean value.
 * @param {string} nextPath The path of the next configuration file that also holds this boolean value.
 * @param {string} propertyName The property name of the owner object of the passed boolean value.
 * @throws {Error} Thrown if `booleanValue` is not a boolean value.
 */
ConfigurationNormalizer._mapBooleanProperty = function (booleanValue, nextPath, propertyName) {
    if (booleanValue === undefined || booleanValue === null) {
        return false;
    }
    if (!util.isBoolean(booleanValue)) {
        throw new Error(propertyName + ' of "' + nextPath + '" must be a boolean value but is ' + booleanValue + '!');
    }
    return /** @type {boolean} */ (booleanValue);
};

/**
 * Resolves all relative paths agains `this._basePath`.
 *
 * @private
 *
 * @returns {Array<string>} the array with all the resolved paths.
 * @param {Array<string>} paths An array of paths.
 *
 * @suppress {visibility}
 */
ConfigurationNormalizer.prototype._resolvePaths = function (paths) {
    var self = this;
    return paths.map(function (item) {
        return path.resolve(self._basePath, item);
    });
};

/**
 * A helper function that checks and normalizes the buildOptions property.
 *
 * @private
 * @static
 *
 * @returns {Array<string>} An array representing the normalized buildOptions.
 * @param {Object|Array<string>} buildOptions The potential build options.
 * @param {string=} compilationUnit The compilation unit this build options belong to. If no value is passed, the passed
 *        buildOptions are treated as global buildOptions of a configuration file.
 * @throws {Error} Thrown if the passed buildOptions argument is invalid.
 *
 * @suppress {visibility}
 */
ConfigurationNormalizer._normalizeBuildOptions = function (buildOptions, compilationUnit) {
    if (buildOptions === undefined || buildOptions === null) return [];

    if (util.isArray(buildOptions)) {
        if (utils.isStringArray(buildOptions)) {
            return /** @type {Array<string>} */ (buildOptions);
        } else {
            if (util.isString(compilationUnit)) {
                throw new Error('"buildOptions" of ' + compilationUnit + '" must be an object or a string array, ' +
                                'but found ' + buildOptions + '!');
            } else {
                throw new Error('"buildOptions" must be an object or a string array, but found ' + buildOptions + '!');
            }
        }
    } else if (util.isObject(buildOptions)) {
        return Object.keys(buildOptions).reduce(function (accumulator, key) {
            if (util.isArray(buildOptions[key])) {
                if (utils.isStringArray(buildOptions[key])) {
                    buildOptions[key].forEach(function (option) {
                        accumulator.push('--' + key, option);
                    });
                } else {
                    if (util.isString(compilationUnit)) {
                        throw new Error('"buildOptions" of ' + compilationUnit + ' supports arrays only with string ' +
                                        'items, but found ' + buildOptions[key] + '!');
                    } else {
                        throw new Error('"buildOptions" supports arrays only with string items, but found ' +
                                        buildOptions[key] + '!');
                    }
                }
            } else if (util.isString(buildOptions[key])) {
                accumulator.push('--' + key, buildOptions[key]);
            } else if (util.isBoolean(buildOptions[key])) {
                if (buildOptions[key]) accumulator.push('--' + key);
            } else {
                throw new Error('"buildOptions" must contain only strings, arrays and booleans when defined as ' +
                                'object!\nBut found ' + buildOptions[key] + '!');
            }
            return accumulator;
        }, []);
    } else {
        var errorMessage;
        if (util.isString(compilationUnit)) {
            errorMessage = '"buildOptions" of "' + compilationUnit + '" must be of the type Array<string> or ' +
                'Object<string, (Array<string>|string|boolean)> but is ' + buildOptions + '!';
        } else {
            errorMessage = '"buildOptions" must be of the type Array<string> or ' +
                'Object<string, (Array<string>|string|boolean)> but is ' + buildOptions + '!';
        }
        throw new Error(errorMessage);
    }
};

/**
 * Starts the normalization process of the `buildOptions` data that was passed to the constructor function.
 *
 * @returns {Object} An array representing the normalized buildOptions.
 * @throws {Error} Thrown if the passed buildOptions argument is invalid.
 *
 * @suppress {visibility}
 */
ConfigurationNormalizer.prototype.normalize = function () {
    var self = this;
    var result = {};
    result.sources = this._resolvePaths(ConfigurationNormalizer._mapStringArray(this._config.sources, 'sources'));
    result.externs = this._resolvePaths(ConfigurationNormalizer._mapStringArray(this._config.externs, 'externs'));
    result.buildOptions = ConfigurationNormalizer._normalizeBuildOptions(this._config.buildOptions);
    if (util.isObject(this._config.compilationUnits)) {
        result.compilationUnits = Object.keys(this._config.compilationUnits).reduce(function (accumulator, key) {
            self._config.compilationUnits[key].sources =
                self._resolvePaths(
                    ConfigurationNormalizer._mapStringArray(self._config.compilationUnits[key].sources, 'sources'));
            self._config.compilationUnits[key].externs =
                self._resolvePaths(
                    ConfigurationNormalizer._mapStringArray(self._config.compilationUnits[key].externs, 'externs'));
            self._config.compilationUnits[key].buildOptions =
                ConfigurationNormalizer._normalizeBuildOptions(self._config.compilationUnits[key].buildOptions, key);
        }, {});
    } else {
        result.compilationUnits = {};
    }
    if (util.isObject(this._config.next)) {
        result.next = Object.keys(this._config.next).reduce(function (accumulator, key) {
            var resolvedPath = path.resolve(self._basePath, key);
            accumulator[resolvedPath].inheritSources =
                ConfigurationNormalizer._mapBooleanProperty(result[key].inheritSources, key, 'inheritSources');
            accumulator[resolvedPath].inheritExterns =
                ConfigurationNormalizer._mapBooleanProperty(result[key].inheritExterns, key, 'inheritExterns');
            accumulator[resolvedPath].inheritBuildOptions =
                ConfigurationNormalizer._mapBooleanProperty(
                    result[key].inheritBuildOptions, key, 'inheritBuildOptions');
        }, {});
    } else {
        result.next = {};
    }
    return result;
};

/**
 * Reads and parses a confugration file.
 *
 * @private
 *
 * @returns {Promise<Object|Error>} A promise that holds the parsed configuration object or an error object.
 * @param {string} configPath The path to the configuration file that should be read and parsed.
 */
function readAndParseConfig (configPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(configPath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    var configObject = /** @type {Object} */ (JSON.parse(/** @type {string} */ (data)));
                    var configNormalizer = new ConfigurationNormalizer(configObject, configPath);
                    resolve(configNormalizer.normalize());
                } catch (jsonError) {
                    reject(new Error('Could not read the configuration file "' + configPath + '"!\n' + jsonError));
                }
            }
        });
    });
}

module.exports.getLocalConfigFiles = getLocalConfigFiles;
module.exports.ConfigurationNormalizer = ConfigurationNormalizer;
