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
var path = require('path');

/**
 * @ignore
 * @suppress {duplicate}
 */
var utils = require('./utils');

/**
 * @ignore
 * @suppress {duplicate}
 */
var VariableManager = /** @type {function(new:VariableManager, VariableManager=)} */
    (require('./VariableManager.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var VariableParser = /** @type {function(new:VariableParser, VariableManager)} */
    (require('./VariableParser.js'));

/**
 * Constructor function for Configurationormalizer.
 *
 * @constructor
 * @classdesc This class is responsible to check and normalize a configuration object.
 *
 * @param {Object=} config The loaded configuration object. If `undefined` or `null` is passed `{}` is used.
 * @param {string=} basePath The path against each relative path of the configuration is resolved.
 * @param {VariableManager=} variableManager An optional object that contains all variables and their values that can
 *        be used in the configuration file.
 * @param {boolean=} useAbsolutePaths If set to true, all paths are transformed to absolute paths in the configuration
 *        file.
 * @throws {Error} Thrown if `config` is not `undefined`, `null` or an object.
 */
function ConfigurationNormalizer (config, basePath, variableManager, useAbsolutePaths) {
    if (config === undefined || config === null || util.isObject(config)) {
        this._config = config || {};
    } else {
        throw new Error('"config" must be of the type object|null|undefined but is ' + config + '!');
    }
    if (variableManager && !(variableManager instanceof
                             /** @type {function(new:VariableManager, VariableManager=)} */ (VariableManager))) {
        throw new Error('"variableManager" must be of the type object|null|undefined!');
    }

    this._variableParser = new VariableParser(
        variableManager || new /** @type {function(new:VariableManager, VariableManager=)} */(VariableManager)());

    this._useAbsolutePaths = useAbsolutePaths;
    if (!util.isBoolean(this._useAbsolutePaths)) this._useAbsolutePaths = false;

    if (basePath == null) this._basePath = process.cwd();
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
    if (booleanValue == null) {
        return false;
    }
    if (!util.isBoolean(booleanValue)) {
        throw new Error(propertyName + ' of "' + nextPath + '" must be a boolean value but is ' + booleanValue + '!');
    }
    return /** @type {boolean} */ (booleanValue);
};

/**
 * Resolves all relative paths against `this._basePath`.
 *
 * @private
 *
 * @returns {Array<string>} the array with all the resolved paths.
 * @param {Array<string>} paths An array of paths.
 */
ConfigurationNormalizer.prototype._resolvePaths = function (paths) {
    var self = this;
    return paths.map(function (item) {
        return self._resolvePath(item);
    });
};

/**
 * Resolves a relative path against `this._basePath`.
 *
 * @private
 *
 * @returns {string|undefined} A string representing a resolved path.
 * @param {string} filePath A string representing a file/folder path.
 */
ConfigurationNormalizer.prototype._resolvePath = function (filePath) {
    var self = this;
    if (!filePath) return undefined;
    if (path.isAbsolute(filePath)) return path.normalize(filePath);
    else if (this._useAbsolutePaths) return path.resolve(self._basePath, filePath);
    else return path.relative(process.cwd(), path.resolve(self._basePath, filePath)) || '.';
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
 */
ConfigurationNormalizer._normalizeBuildOptions = function (buildOptions, compilationUnit) {
    if (buildOptions === undefined || buildOptions === null) return [];
    if (util.isArray(buildOptions)) {
        if (utils.isStringArray(buildOptions)) {
            return buildOptions.reduce(function (accumulator, currentOption) {
                if (currentOption.startsWith('--') && currentOption.indexOf('=') !== -1) {
                    var parts = currentOption.split('=');
                    if (parts.length === 1) {
                        accumulator.push(currentOption);
                    } else {
                        accumulator.push(parts[0], parts.slice(1).join('='));
                    }
                } else {
                    accumulator.push(currentOption);
                }
                return accumulator;
            }, []);
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
        }, []) || [];
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
 * Replaces all variables identifiers by their values.
 *
 * @private
 *
 * @returns {Array<string>} The parsed strings.
 * @param {Array<string>} strs The strings read from the configuration file.
 * @param {boolean=} isPath True if the passed strings are file pathes, i.e. they will be resolved against the CWD.
 *        The default value nis false.
 * @throws {Error} Thrown if `strs` is not a string array.
 * @throws {Error} Thrown if an undefined variable identifier is used.
 */
ConfigurationNormalizer.prototype._resolveVariables = function (strs, isPath) {
    var self = this;
    if (!utils.isStringArray(strs)) throw new Error('"strs" must be a string array!');
    return strs.map(function (str) {
        var resolvedString = self._variableParser.resolve(str);
        if (resolvedString === str && isPath === true) return self._resolvePath(str || '.');
        else if (isPath) return path.normalize(resolvedString);
        else return resolvedString;
    });
};

/**
 * Returns a normalized warningsFilterFile value.
 *
 * @private
 *
 * @returns {Array<string>} An array of paths which is empty in case no value is specified.
 * @param {string|Array<string>} configProperty The configuration property that is being checked.
 */
ConfigurationNormalizer.prototype._normalizeWarningsFilterFile = function (configProperty) {
    if (!configProperty) return [];
    var self = this;
    var result;
    if (configProperty && util.isString(configProperty)) {
        result = this._resolveVariables([configProperty], true);
    } else if (configProperty && util.isArray(configProperty)) {
        result = this._resolveVariables(/** @type {Array<string>} */ (configProperty), true);
    }
    return result || [];
};

/**
 * Starts the normalization process of the `buildOptions` data that was passed to the constructor function.
 *
 * @returns {Object} An array representing the normalized buildOptions.
 * @throws {Error} Thrown if the passed buildOptions argument is invalid.
 */
ConfigurationNormalizer.prototype.normalize = function () {
    var self = this;
    var result = {};
    result.sources =
        this._resolveVariables(ConfigurationNormalizer._mapStringArray(this._config.sources, 'sources'), true);
    result.externs =
        this._resolveVariables(ConfigurationNormalizer._mapStringArray(this._config.externs, 'externs'), true);
    result.buildOptions =
        this._resolveVariables(ConfigurationNormalizer._normalizeBuildOptions(this._config.buildOptions), false);
    result.checkFs = {};
    if (util.isObject(this._config.checkFs)) {
        result.checkFs.check = this._resolveVariables(
            ConfigurationNormalizer._mapStringArray(this._config.checkFs.check, 'checkFs.check'), true);
        result.checkFs.ignore = this._resolveVariables(
            ConfigurationNormalizer._mapStringArray(this._config.checkFs.ignore, 'checkFs.ignore'), true);
        if (this._config.checkFs.fileExtensions == null) {
            result.checkFs.fileExtensions = ['.js', '.json'];
        } else {
            result.checkFs.fileExtensions = this._resolveVariables(
                ConfigurationNormalizer._mapStringArray(this._config.checkFs.fileExtensions, 'checkFs.fileExtensions'),
                false);
        }
    }
    result.warningsFilterFile = this._normalizeWarningsFilterFile(this._config.warningsFilterFile);

    if (util.isObject(this._config.compilationUnits)) {
        result.compilationUnits = Object.keys(this._config.compilationUnits)
            .reduce(function (accumulator, key) {
                var finalKey = self._variableParser.resolve(key);
                accumulator[finalKey] = {};
                accumulator[finalKey].sources =
                    self._resolveVariables(
                        ConfigurationNormalizer._mapStringArray(
                            self._config.compilationUnits[key].sources, 'sources'), true);
                accumulator[finalKey].externs =
                    self._resolveVariables(
                        ConfigurationNormalizer._mapStringArray(
                            self._config.compilationUnits[key].externs, 'externs'), true);
                accumulator[finalKey].buildOptions =
                    self._resolveVariables(ConfigurationNormalizer._normalizeBuildOptions(
                        self._config.compilationUnits[key].buildOptions, key), false);
                if (self._config.compilationUnits[key].outputFile) {
                    accumulator[finalKey].outputFile =
                        self._resolvePath(self._variableParser.resolve(self._config.compilationUnits[key].outputFile));
                }
                accumulator[finalKey].warningsFilterFile =
                    self._normalizeWarningsFilterFile(self._config.compilationUnits[key].warningsFilterFile);
                return accumulator;
            }, {}) || {};
    } else {
        result.compilationUnits = {};
    }

    if (util.isObject(this._config.next)) {
        result.next = Object.keys(this._config.next)
            .reduce(function (accumulator, key) {
                var resolvedPath = path.resolve(self._basePath, self._variableParser.resolve(key));
                accumulator[resolvedPath] = {};
                accumulator[resolvedPath].inheritSources =
                    ConfigurationNormalizer._mapBooleanProperty(
                        self._config.next[key].inheritSources, key, 'inheritSources');
                accumulator[resolvedPath].inheritExterns =
                    ConfigurationNormalizer._mapBooleanProperty(
                        self._config.next[key].inheritExterns, key, 'inheritExterns');
                accumulator[resolvedPath].inheritBuildOptions =
                    ConfigurationNormalizer._mapBooleanProperty(
                        self._config.next[key].inheritBuildOptions, key, 'inheritBuildOptions');
                accumulator[resolvedPath].inheritWarningsFilterFile =
                    ConfigurationNormalizer._mapBooleanProperty(
                        self._config.next[key].inheritWarningsFilterFile, key, 'inheritWarningsFilterFile');
                return accumulator;
            }, {}) || {};
    } else {
        result.next = {};
    }

    return result;
};

module.exports = ConfigurationNormalizer;
