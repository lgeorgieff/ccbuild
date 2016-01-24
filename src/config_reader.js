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
 */
function getLocalConfigFiles () {
    var deferred = Q.defer();
    fs.readdir('.', function (err, fileNames) {
        let configPromises = fileNames.map(function (fileName) {
            var configDeferred = Q.defer();
            if (fileName.endsWith(DEFAULT_CONFIG_EXTENSION)) {
                var absolutePath = path.resolve(fileName);
                fs.stat(absolutePath, function(err, stats) {
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

module.exports.getLocalConfigFiles = getLocalConfigFiles;
