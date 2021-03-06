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
var path = require('path');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Q = require('q');

/**
 * @ignore
 * @suppress {duplicate}
 */
var utils = require('./utils');

/**
 * @ignore
 * @suppress {duplicate}
 */
var ConfigurationNormalizer = /** @type {function(new:ConfigurationNormalizer, Object=, string=, VariableManager=)}*/
    (require('./ConfigurationNormalizer.js'));

/**
 * @type {string}
 * @const
 * @default '.ccbuild'
 */
var DEFAULT_CONFIG_EXTENSION = '.ccbuild';

/**
 * Get the paths for all local config files.
 *
 * @return {Promise<Array<string>>} A promise that holds an array of strings.
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
            if (errorReason) deferred.reject(errorReason);
            else deferred.resolve(configFiles);
        });
    });
    return deferred.promise;
}

/**
 * Merges a configuration file with its parent configuration file according to the settings in `inheritSources`,
 * `inheritExterns` and `inheritBuildOptions`.
 *
 * @private
 *
 * @returns {Object} The merged configuration object.
 * @param {?Object} configuration The current valid configuration object.
 * @param {string} configurationPath The path of the current valid configuration object.
 * @param {Object=} parentConfiguration An optional parent configuration object of the current valid configuration
 *        object.
 */
function mergeConfigurations (configuration, configurationPath, parentConfiguration) {
    if (!parentConfiguration && !configuration) return (new ConfigurationNormalizer()).normalize();
    if (!parentConfiguration) return configuration;
    if (!configuration) return parentConfiguration;
    var resultSources;
    if (parentConfiguration.next[configurationPath] && parentConfiguration.next[configurationPath].inheritSources) {
        resultSources = utils.mergeArrays(parentConfiguration.sources, configuration.sources);
    } else {
        resultSources = configuration.sources;
    }
    var resultExterns;
    if (parentConfiguration.next[configurationPath] && parentConfiguration.next[configurationPath].inheritExterns) {
        resultExterns = utils.mergeArrays(parentConfiguration.externs, configuration.externs);
    } else {
        resultExterns = configuration.externs;
    }
    var resultBuildOptions;
    if (parentConfiguration.next[configurationPath] &&
        parentConfiguration.next[configurationPath].inheritBuildOptions) {
        resultBuildOptions = utils.mergeArguments(parentConfiguration.buildOptions, configuration.buildOptions);
    } else {
        resultBuildOptions = configuration.buildOptions;
    }
    var resultWarningsFilterFile = [];
    Array.prototype.push.apply(resultWarningsFilterFile, configuration.warningsFilterFile);
    if (parentConfiguration.next[configurationPath] &&
        parentConfiguration.next[configurationPath].inheritWarningsFilterFile) {
        Array.prototype.push.apply(resultWarningsFilterFile, parentConfiguration.warningsFilterFile);
    }
    resultWarningsFilterFile = utils.arrayToSet(resultWarningsFilterFile);

    return {
        checkFs: configuration.checkFs,
        sources: resultSources,
        externs: resultExterns,
        outputFile: configuration.outputFile,
        warningsFilterFile: resultWarningsFilterFile,
        buildOptions: resultBuildOptions,
        compilationUnits: configuration.compilationUnits,
        next: configuration.next
    };
}

/**
 * Reads and parses a confugration file.
 *
 * @returns {Promise<Object|Error>} A promise that holds the parsed configuration object or an error object.
 * @param {string} configPath The path to the configuration file that should be read and parsed.
 * @param {Object=} parentConfig An optional configuration object that represents the parent configuration of the
 *        current configuration file. This is used for inehritung configuration settings.
 * @param {VariableManager=} variableManager An object that is used for variable resolution.
 */
function readAndParseConfiguration (configPath, parentConfig, variableManager) {
    var deferred = Q.defer();

    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            deferred.reject(err);
        } else {
            try {
                var configObject = /** @type {Object} */ (JSON.parse(/** @type {string} */ (data)));
                var configNormalizer =
                        new ConfigurationNormalizer(configObject, path.dirname(configPath), variableManager);
                var normalizedConfig = configNormalizer.normalize();
                deferred.resolve(mergeConfigurations(normalizedConfig, path.resolve(configPath), parentConfig));
            } catch (configError) {
                deferred.reject(new Error('Could not read the configuration file "' + configPath + '"!\n' +
                                          configError));
            }
        }
    });

    return deferred.promise;
}

module.exports.getLocalConfigFiles = getLocalConfigFiles;
module.exports.readAndParseConfiguration = readAndParseConfiguration;
