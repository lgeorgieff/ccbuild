'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var crypto = require('crypto');

/**
 * @ignore
 * @suppress {duplicate}
 */
var stream = require('stream');

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
var NotFoundInCacheError = /** @type {function (new:NotFoundInCacheError, string, string, string): undefined}*/
    (require('./NotFoundInCacheError.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var OutdatedCacheError = /** @type {function (new:OutdatedCacheError, string, string, string, string): undefined}*/
    (require('./OutdatedCacheError.js'));

/**
 * Contains for each cache folder location an existing {@link CCCache} instance.
 *
 * @private
 */
var instances = {};

/**
 * The file name of the bibliography file that contians the hash index for the compilation cache.
 *
 * @private
 * @const
 */
var BIB_FILE_NAME = 'bibliography.json';

/**
 * The constructor function for {@link CCCache}. This class is a singleton per cache folder to avoid concurrency on
 * file system level.
 *
 * @classdesc This class is responsible for caching compilation units.
 *
 * @constructor
 *
 * @param {!string} cacheFolder A folder path where CCBuild stores all cached content.
 * @throws {Error} Thrown if cacheFolder is an empty string.
 */
function CCCache (cacheFolder) {
    var normalizedCacheFolderString = cacheFolder.trim();
    if (normalizedCacheFolderString.length === 0) {
        throw new Error('"cacheFolder" must not be an empty string');
    }

    var normalizedCacheFolder = path.resolve(normalizedCacheFolderString);

    if (instances[normalizedCacheFolder]) {
        return instances[normalizedCacheFolder];
    } else {
        instances[normalizedCacheFolder] = this;
    }

    this._cacheFolder = normalizedCacheFolder;
    this._bibliography = {};
    this._readBibliographyPromise = null;
    this._persistPromise = Q.resolve();
}

/**
 * Read the index file on FS level and load the caech index.
 *
 * @private
 *
 * @returns {QPromise<Object>} A promise holding the JSON data of the loaded index file or an error in case of FS or
 *          parsing problems.
 */
CCCache.prototype._readBibliography = function () {
    if (this._readBibliographyPromise) {
        return this._readBibliographyPromise;
    }

    var self = this;
    var deferred = Q.defer();
    fs.readFile(path.join(this._cacheFolder, BIB_FILE_NAME), 'utf8', function (err, data) {
        if (err && err.code !== 'ENOENT') {
            // The operation was only considered as failed when the file could not be read but did exist.
            // In it did not exist, it will be created during the next write operation.
            deferred.reject(err);
        } else {
            try {
                self._bibliography = err ? {} : JSON.parse(data);
                deferred.resolve(self._bibliography);
            } catch (parserError) {
                deferred.reject('Could not read index file of cache "' + self._cacheFolder + '" due to ' + parserError);
            }
        }
    });

    this._readBibliographyPromise = deferred.promise;
    return this._readBibliographyPromise;
};

/**
 * Tries to get a cached compilation result. In case there is nothing cached yet for the given compilation unit an error
 * is returned. In case the data held in the cache is outdated, the cache for this compilation unit is cleaned and an
 * error is returned.
 *
 * @returns {QPromise<Object>} A promise holding the cached compilation result. In case the requested compilation unit
 *          is not cached the promise is rejected with a {@link NotFoundInCacheError}. In case the compilation unit is
 *          cached but outdated the promise is rejected with a {@link OutdatedCacheError}.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the current compilation unit.
 */
CCCache.prototype.get = function (compilationUnit) {
    var self = this;
    return this._readBibliography()
        .then(function () {
            return self._generateHash(compilationUnit);
        })
        .then(function (compilationUnitHash) {
            var cachedHash = self._bibliography[compilationUnit.unitName];
            if (cachedHash === compilationUnitHash) {
                return self._getCachedResult(compilationUnit.unitName, compilationUnitHash);
            } else if (cachedHash !== undefined) {
                return self.clean(compilationUnit)
                    .then(function () {
                        return Q.reject(new OutdatedCacheError(compilationUnit.unitName, cachedHash,
                                                               compilationUnitHash, self._cacheFolder));
                    });
            } else {
                return Q.reject(new NotFoundInCacheError(compilationUnit.unitName, compilationUnitHash,
                                                         self._cacheFolder));
            }
        });
};

/**
 * Write the generated JavaScript code into the cache. In case the compilaton unit is already cached it will be
 * overwritten.
 *
 * @returns {QPromise} A resolved promise in case of success. In case the requested compilation unit is not cached the
 *          promise is rejected with a {@link NotFoundInCacheError}.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the requested compilation unit.
 * @param {Object} compilationResult The result of the Google Closure Compiler that will be cached.
 */
CCCache.prototype.write = function (compilationUnit, compilationResult) {
    var self = this;
    return this._readBibliography()
        .then(function () {
            var compilationUnitHash = self._bibliography[compilationUnit.unitName];
            if (compilationUnitHash) {
                return self.clean(compilationUnit);
            }
        })
        .then(function () {
            return self._generateHash(compilationUnit);
        })
        .then(function (compilationUnitHash) {
            self._bibliography[compilationUnit.unitName] = compilationUnitHash;
            var deferred = Q.defer();
            try {
                var content = JSON.stringify(compilationResult);
                fs.writeFile(path.join(self._cacheFolder, compilationUnitHash + '.json'), content, 'utf8',
                             function (err) {
                                 if (err) {
                                     deferred.reject('Could not write cache for the compilation unit "' +
                                                     compilationUnit.unitName + '" due to ' + err);
                                 } else {
                                     deferred.resolve();
                                 }
                             });
            } catch (err) {
                deferred.reject('Could not write compilation result into cache for the compilation unit "' +
                                compilationUnit.unitName + '" due to ' + err);
            }

            return deferred.promise;
        });
};

/**
 * This class must be called to persist the cache before the programme will exit.
 *
 * @return {QPromise} A promise that is resolved in case the cache is completetly persisted or a rejeted in case of an
 *         error.
 */
CCCache.prototype.persist = function () {
    var self = this;

    this._persistPromise = this._persistPromise
        .then(function () {
            return self._readBibliography()
                .then(function () {
                    var deferred = Q.defer();
                    try {
                        var content = JSON.stringify(self._bibliography);
                        fs.writeFile(path.join(self._cacheFolder, BIB_FILE_NAME), content, 'utf8', function (err) {
                            if (err) {
                                deferred.reject('Could not persist index file for cache due to' + err);
                            } else {
                                deferred.resolve();
                            }
                        });
                    } catch (err) {
                        deferred.reject('Could not persist inde file for cache due to' + err);
                    }
                    return deferred.promise;
                });
        });
    return this._persistPromise;
};

/**
 * Remove the entry from the bibliography file and remove the actual cached compilation result.
 *
 * @private
 *
 * @returns {QPromise<Object>} A promise that is resolved in case of success or rejected otherwise.
 *          In case an FS error is thrown the promise is rejected with the original error instance.
 *          In case the compilation unit is not cached the promise is rejected with an {@link NotFoundInCacheError}
 *          error.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the requested compilation unit.
 */
CCCache.prototype._cleanCompilationUnit = function (compilationUnit) {
    var self = this;
    return this._readBibliography()
        .then(function () {
            var compilationUnitHash = self._bibliography[compilationUnit.unitName];
            var deferred = Q.defer();
            if (compilationUnitHash) {
                fs.unlink(path.join(self._cacheFolder, compilationUnitHash + '.json'), function (err) {
                    if (err) {
                        deferred.reject('Failed to clean the cache for the compilation unit "' +
                                        compilationUnit.unitName + '" due to ' + err);
                    } else {
                        deferred.resolve(true);
                    }
                });
                return deferred.promise;
            } else {
                deferred.reject(new NotFoundInCacheError(compilationUnit.unitName, compilationUnitHash,
                                                         self._cacheFolder));
                return deferred.promise;
            }
        })
        .then(function (entryFound) {
            delete self._bibliography[compilationUnit.unitName];
        });
};

/**
 * Remove all content of the cache folder. It is required that the cache folder contains only file and no folders.
 *
 * @private
 *
 * @returns {QPromise} A resolved promise in case all content of the cache folder was removes successfully. A rejected
 *          promise otherwise.
 */
CCCache.prototype._cleanAll = function () {
    var self = this;
    return (this._readBibliographyPromise || Q.resolve())
        .then(function () {
            var deferred = Q.defer();
            fs.readdir(self._cacheFolder, function (err, fileNames) {
                if (err) {
                    deferred.reject('Could not clean the cache folder "' + self._cacheFolder + '" due to ' + err);
                } else {
                    var filePaths = fileNames.map(function (fileName) {
                        return path.join(self._cacheFolder, fileName);
                    });
                    deferred.resolve(filePaths);
                }
            });
            return deferred.promise;
        })
        .then(function (filePaths) {
            return filePaths.map(function (filePath) {
                var deferred = Q.defer();
                fs.unlink(filePath, function (err) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve();
                    }
                });
                return deferred.promise;
            });
        })
        .then(function (rmPromises) {
            return Q.all(rmPromises);
        })
        .then(function () {
            self._bibliography = {};
        });
};

/**
 * Remove the entry from the bibliography file and remove the actual cached compilation result in case the argument
 * `compilationUnit` is defined. If the optional parameter `compilationUnit` is not defined, the entire cache is
 * deleted.
 *
 * @returns {QPromise<Object>} A promise that is resolved in case of success or rejected otherwise.
 *          In case an FS error is thrown the promise is rejected with the original error instance.
 *          In case the compilation unit is not cached the promise is rejected with an {@link NotFoundInCacheError}
 *          error.
 * @param {CompilerConfiguration=} compilationUnit An optional argument that defines the compiler configuration for the
 *        compilation unit to be deleted.
 */
CCCache.prototype.clean = function (compilationUnit) {
    if (compilationUnit) {
        return this._cleanCompilationUnit(compilationUnit);
    } else {
        return this._cleanAll();
    }
};

/**
 * Create a {@link Readable} stream of the given string.
 *
 * @private
 * @returns {stream.Readable} A stream for the given stirng value
 * @param {string} item A string value.
 */
CCCache.prototype._stringToStream = function (item) {
    if (typeof (item) === 'string') {
        var s = new stream.Readable();
        s.push(item);
        s.push(null);
        return s;
    } else {
        throw new Error('Error occurred when handling cache at "' + this._cacheFolder + '" "item" must be either a ' +
                        'string or a Readable');
    }
};

/**
 * Generate a hash for all given items.
 *
 * @private
 *
 * @returns {QPromise<string>} A promise either holding a string in hex representation of a sha-256 hash or holding an
 *          {@link Error} in case of rejection.
 * @param {Array<stream.Readable>} items A list of {@link Readable} streams that are piped into the hashing function and will
 *        result in the final sha256-hash.
 */
CCCache.prototype._generateHashForItems = function (items) {
    var hash = crypto.createHash('sha256');
    hash.setEncoding('hex');
    var deferred = Q.defer();
    var populateHasher = function (itemsToBeHashed) {
        if (itemsToBeHashed.length === 0) {
            hash.end();
            deferred.resolve(hash.read());
        } else {
            if (itemsToBeHashed[0].closedDueToError !== undefined) {
                deferred.reject(itemsToBeHashed[0].closedDueToError);
            } else if (itemsToBeHashed.length === 1) {
                itemsToBeHashed[0].on('data', function (data) {
                    hash.update(data, 'utf8');
                });
                itemsToBeHashed[0].on('end', function () {
                    hash.end();
                    deferred.resolve(hash.read());
                });
                itemsToBeHashed[0].on('error', function (err) {
                    deferred.reject(err);
                });
            } else {
                itemsToBeHashed[0].on('data', function (data) {
                    hash.update(data, 'utf8');
                });
                itemsToBeHashed[0].on('end', function () {
                    populateHasher(itemsToBeHashed.slice(1));
                });
                itemsToBeHashed[0].on('error', function (err) {
                    deferred.reject(err);
                });
            }
        }
    };
    populateHasher(items);

    return deferred.promise;
};

/**
 * Create a file stream (Readable) for each given file path.
 *
 * @private
 *
 * @returns {Array<stream.Readable>} A list of {@link Readable} streams for all given file paths.
 * @param {Array<string>} filePaths Paths to files that are returned as {@link Readable} streams.
 */
CCCache.prototype._getFileStreams = function (filePaths) {
    return (filePaths || [])
        .map(function (filePath) {
            return fs.createReadStream(filePath, {encoding: 'utf8'});
        })
        .map(function (readStream) {
            return readStream.on('error', function (err) {
                this.closedDueToError = err;
                readStream.close();
            });
        });
};

/**
 * Get a file stream (ReadStream) that represents the flagfile which was passed via the options argument.
 *
 * @private
 *
 * @returns {?stream.Readable} The stream for a flagfile specified via `options`. In case no flagfile is specified in `options`
 *          `null` is returned.
 * @param {!Array<string>} options The build options for the closure compiler.
 */
CCCache.prototype._getFlagfileStream = function (options) {
    for (var i = 0; i !== options.length; ++i) {
        if (options[i] === '--flagfile') {
            break;
        }
    }
    if (i < options.length - 1) {
        return this._getFileStreams([options[i + 1]])[0];
    }
    return null;
};

/**
 * Generate a hash for a compilation unit. This has may be used to analyze whether a compilation unit was updated.
 *
 * @private
 *
 * @returns {QPromise<string>} A promise holding the hash that represents the passed compilation unit.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the requested compilation unit.
 */
CCCache.prototype._generateHash = function (compilationUnit) {
    try {
        var self = this;
        var allFiles = compilationUnit.globalSources
        .concat(compilationUnit.unitSources)
        .concat(compilationUnit.globalExterns)
        .concat(compilationUnit.unitExterns)
        .concat(compilationUnit.globalWarningsFilterFile)
        .concat(compilationUnit.unitWarningsFilterFile);

        var itemsToBeHashed = this._getFileStreams(allFiles)
            .concat(compilationUnit.globalBuildOptions.map(function (option) {
                return self._stringToStream(option);
            }))
            .concat(compilationUnit.unitBuildOptions.map(function (option) {
                return self._stringToStream(option);
            }));
        var globalFlagfile = this._getFlagfileStream(compilationUnit.globalBuildOptions);
        var unitFlagfile = this._getFlagfileStream(compilationUnit.unitBuildOptions);
        if (globalFlagfile) {
            itemsToBeHashed.push(globalFlagfile);
        }
        if (unitFlagfile) {
            itemsToBeHashed.push(unitFlagfile);
        }
        return this._generateHashForItems(itemsToBeHashed)
            .then(function (hashValue) {
                return hashValue;
            });
    } catch (err) {
        return Q.reject(err);
    }
};

/**
 * Get the result for a compilation unit from the cached data.
 *
 * @private
 *
 * @returns {QPromise<Object>} A promise holding the cached compilation result. In case the requested compilation unit
 *          is not cached the promise is rejected with a {@link NotFoundInCacheError}.
 * @param {string} compilationUnitName The name of the compilation unit that is searched in the cache.
 * @param {string} compilationUnitHash The calculated has of the compilation unit that is searched in the cache.
 *
 * @throws {Error} Thrown if the access or processing to the cache failed.
 * @throws {NotFoundInCacheError} Thrown if no result is found in the cache for the requested compilation unit.
 */
CCCache.prototype._getCachedResult = function (compilationUnitName, compilationUnitHash) {
    var cachePath = path.join(this._cacheFolder, compilationUnitHash + '.json');

    var deferred = Q.defer();
    fs.readFile(cachePath, 'utf8', function (err, data) {
        if (err && err.code === 'ENOENT') {
            deferred.reject(new NotFoundInCacheError(compilationUnitName, compilationUnitHash, this._cacheFolder));
        } else if (err) {
            deferred.reject(new Error(err));
        } else {
            try {
                deferred.resolve(JSON.parse(data));
            } catch (err) {
                deferred.reject(new Error('Could not parse the cached file ' + cachePath + ': ' + err));
            }
        }
    });

    return deferred.promise;
};

/**
 * Get the normalized cache folder this object is bound to.
 *
 * @returns {string} The normalized cache folder.
 */
CCCache.prototype.getCacheFolder = function () {
    return this._cacheFolder;
};

module.exports = CCCache;
