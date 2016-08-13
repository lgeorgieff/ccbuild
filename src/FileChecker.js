'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var events = require('events');

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

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
var utils = require('./utils.js');

/**
 * @typedef {{filesToCheck: !Array<string>, fileExtensions: !Array<string>, filesToIgnore: !Array<string>,
 *            filesInUnits: !Array<string>}}
 *
 * @description An object including all options required for constructing an instance of {@link FileChecker}.
 * - {Array<string>} options.filesToCheck A collection of glob expressions that describes all files to be checked.
 *   In case a glob expression evaluates to a folder path, all files in this directorie's tree will be checked.
 * - {Array<string>} options.fileExtensions An Array of file extensions. This filter is applied on all files resulting
 *   from `filesToCheck`.
 * - {Array<string>} options.filesToIgnore An array of glob expressions that is applied on the file list that results
 *   from `filesToCheck` and `fileExtensions`. All files that are in the first list but will also be determined by
 *   `filesToIgnore` will be excluded from the final list of files that will be checked. In case a glob expression in
 *   `filesToignore` will result in a directory path, all files that are located in this directory or its
 *   sub-directories will be ignored.
 * - {Array<string>} options.filesInUnits All files that are taken into account in any compilation units. Any file that
 *   is in the list of files to be checked that is not mentioned here, will result in an 'verificationError' event.
 */
var FileCheckerOptions;

/**
 * Checks whether all files specified in the check/ignore data are included in the defined compilation units.
 *
 * @constructor
 * @extends events.EventEmitter
 *
 * @emits FileChecker#verificationSuccess
 * @emits FileChecker#verificationError
 * @emits FileChecker#verificationDone
 * @emits FileChecker#error
 *
 * @param {FileCheckerOptions} options An object that includes all options required for constructing a FileChecker
 *        instance.
 * @throws {Error} Thrown in case any of the constructor options is bad.
 *
 * @suppress {misplacedTypeAnnotation}
 */
function FileChecker (options) {
    if (!Array.isArray(options.filesToCheck)) {
        throw new Error('"options.filesToCheck" must be an array of strings!');
    }
    if (!Array.isArray(options.filesToIgnore)) {
        throw new Error('"options.filesToIgnore" must be an array of strings!');
    }
    if (!Array.isArray(options.filesInUnits)) {
        throw new Error('"options.filesInUnits" must be an array of strings!');
    }
    if (!Array.isArray(options.fileExtensions)) {
        throw new Error('"options.fileExtensions" must be an array of strings!');
    }

    events.EventEmitter.call(this);
    this._filesToCheck = options.filesToCheck;
    this._filesToIgnore = options.filesToIgnore;
    this._fileExtensions = options.fileExtensions;
    var absoluteFilesInUnits = options.filesInUnits.map(function (f) {
        return path.resolve(f);
    });
    this._filesInUnits = utils.arrayToSet(absoluteFilesInUnits);
    this._filteredFilesInUnits = [];
    this._filteredFilesToCheck = [];

    var self = this;
    process.nextTick(function () {
        utils.getAllFilesFromDirectories(self._filesInUnits, self._fileExtensions)
            .then(function (filesInUnits) {
                return self._filterForFileExtensions(filesInUnits);
            })
            .then(function (filteredFilesInUnits) {
                self._filteredFilesInUnits = filteredFilesInUnits;
                self._getFilesToCheck()
                    .then(function (filesToCheck) {
                        return self._filterForFileExtensions(filesToCheck);
                    })
                    .then(function (filteredFilesToCheck) {
                        self._filteredFilesToCheck = filteredFilesToCheck;
                        self._verify();
                    })
                    .then(function () {
                        /**
                         * States that the verification process is done and not more files are needed to be verified.
                         *
                         * @event FileChecker#verificationDone
                         */
                        self.emit('verificationDone');
                    })
                    .catch(function (err) {
                        /**
                         * States that an error occurred.
                         *
                         * @event FileChecker#error
                         * @param {Error} err The occurred error.
                         */
                        self.emit('error', err);
                    });
            })
            .catch(function (err) {
                self.emit('error', err);
            });
    });
}

util.inherits(FileChecker, events.EventEmitter);

/**
 * Filters the given paths for their file extensions, i.e. in case a `_fileExtensions` is not an empty array and a given
 * path represents a file and its extension is contained in the `_fileExtensions` array it will be filtered. Otherwise
 * it will be ignored from the resulting array.
 *
 * @private
 *
 * @returns {Array<string>} An array of filtered paths.
 * @param {Array<string>} paths An array of paths to be filtered.
 */
FileChecker.prototype._filterForFileExtensions = function (paths) {
    if (this._fileExtensions.length === 0) return Q.resolve(paths);

    var self = this;
    return Q.all(paths.map(function (p) {
        return utils.isFile(p)
            .then(function (_isFile) {
                if (_isFile && self._fileExtensions.indexOf(path.extname(p)) !== -1) {
                    return p;
                } else if (_isFile) {
                    return undefined;
                } else {
                    return p;
                }
            });
    }))
        .then(function (results) {
            return results.filter(function (r) {
                return r !== undefined;
            });
        });
};

/**
 * Get all files that must be checked by taking `check` and `ignore` into account.
 *
 * @private
 *
 * @returns {Promise} A promise holding an array of files paths.
 */
FileChecker.prototype._getFilesToCheck = function () {
    var self = this;
    return Q.all([utils.expandGlobs(this._filesToCheck)
                  .then(function (filesToCheck) {
                      return utils.getAllFilesFromDirectories(filesToCheck, self._fileExtensions);
                  }), utils.expandGlobs(self._filesToIgnore)])
        .then(function (args) {
            var filesToCheck = args[0];
            var filesAndFoldersToIgnore = args[1];
            var ignoredDirectories;
            var ignoredFiles;
            return Q.all(filesAndFoldersToIgnore.map(function (fileAndFolderToIgnore) {
                return utils.isDirectory(fileAndFolderToIgnore)
                    .then(function (isDir) {
                        return {isDir: isDir,
                                path: fileAndFolderToIgnore};
                    });
            }))
                .then(function (promises) {
                    ignoredDirectories = promises.filter(function (result) {
                        return result.isDir;
                    }).map(function (result) {
                        return result.path;
                    });
                    ignoredFiles = promises.filter(function (result) {
                        return !result.isDir;
                    }).map(function (result) {
                        return result.path;
                    });
                })
                .then(function () {
                    return filesToCheck.filter(function (fileToCheck) {
                        return ignoredFiles.indexOf(fileToCheck) === -1 &&
                            ignoredDirectories.filter(function (ignoredDirectory) {
                                return path.join(ignoredDirectory, path.relative(ignoredDirectory, fileToCheck)) ===
                                    fileToCheck;
                            }).length === 0;
                    });
                })
                .then(function (filteredFilesToCheck) {
                    return filteredFilesToCheck.map(function (f) {
                        return path.resolve(f);
                    });
                })
                .then(function (filteredFilesToCheck) {
                    return utils.arrayToSet(filteredFilesToCheck);
                });
        });
};

/**
 * Performs the verification for all files.
 *
 * @private
 *
 * @emits FileChecker#verificationSuccess
 * @emits FileChecker#verificationError
 *
 * @suppress {misplacedTypeAnnotation}
 */
FileChecker.prototype._verify = function () {
    var self = this;
    this._filteredFilesToCheck.forEach(function (fileToCheck) {
        if (self._filteredFilesInUnits.indexOf(fileToCheck) === -1) {
            /**
             * States that the given file must be present in a compilation unit but is not.
             *
             * @event FileChecker#verificationError
             * @param {string} filePath The checked file path.
             */
            self.emit('verificationError', fileToCheck);
        } else {
            /**
             * States that the given file is be present in a compilation unit.
             *
             * @event FileChecker#verificationSuccess
             * @param {string} filePath The checked file path.
             */
            self.emit('verificationSuccess', fileToCheck);
        }
    });
};

/**
 * Expands all passed globs to paths. Only files are taken into account, i.e. files and other types (except symlinks)
 * are ignored. Duplicate matches are reduced to only one occurrence.
 *
 * @private
 *
 * @returns {Promise} Apromise holding an array containing all expanded file paths
 * @param {Array<string>} globExpressions An array containing glob expressions.
 */
FileChecker.prototype._expandFilesGlobs = function (globExpressions) {
    var resultPromises = (globExpressions || []).reduce(function (accumulator, currentGlobExpression) {
        Array.prototype.push.apply(accumulator, utils.globFiles(currentGlobExpression));
        return accumulator;
    }, []);
    return Q.all(resultPromises).then(function (results) {
        return results.reduce(function (accumulator, currentResult) {
            Array.prototype.push.apply(accumulator, currentResult);
            return accumulator;
        }, []);
    });
};

module.exports = FileChecker;
