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
var glob = /** @type {function(string, Object=, function(Error, Array<string>)): void} */ (require('glob'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var Q = require('q');

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

/**
 * check whether an item is contained in an array.
 *
 * @return {boolean} `true` in case the given item is contained in the given array. `false` otherwise.
 *
 * @param {*} arr The array that is checked for hte given item.
 * @param {*=} item The item that is cecked for existence in the given array.
 */
function arrayContains (arr, item) {
    if (!Array.isArray(arr)) return false;
    return arr.indexOf(item) !== -1;
}

/**
 * Check whether the passed argument is an array that only contains string values.
 *
 * @returns {boolean} `true` if the `arg` is an array which only contains string values. `false` otherwise.
 * @param {*} arr The potential string array.
 */
function isStringArray (arr) {
    if (!arr || !util.isArray(arr)) return false;
    for (var i = 0; i !== arr.length; ++i) if (!util.isString(arr[i])) return false;
    return true;
}

/**
 * Merges two array containing files paths so that the resulting array will have no duplicate entries.
 *
 * @private
 *
 * @template T
 * @returns {Array<T>} The merged set of all passed arrays.
 * @param {Array<T>} arrays A variable amount of arrays.
 * @param {function(T, T): boolean=} comp An optional comparison function. If no one is set `===` is used.
 */
function mergeArrays (arrays, comp) {
    var result = [];
    var arraysLength = arguments.length;
    var compFunction = function (lft, rgt) {
        return lft === rgt;
    };
    if (arguments.length !== 0 && util.isFunction(arguments[arguments.length - 1])) {
        --arraysLength;
        compFunction = arguments[arguments.length - 1];
    }

    for (var i = 0; i < arraysLength; ++i) {
        if (arguments[i]) result = arrayToSet(result.concat(arguments[i]), compFunction);
    }

    return result;
}

/**
 * Gets all values from the passed arguments array. For example the argument array `['--externs', 'file1.js',
 * '--externs' 'file2.js, '--debug']` and the argument `'--externs'` to search for will result in
 * `['file1.js', 'file2.js']`.
 *
 * @private
 *
 * @returns {Array<string>} the filtered argument values.
 * @param {?Array<string>} allArguments The entire arguments array.
 * @param {!string} argumentName The name of the argument to search for.
 */
function getValuesFromArgumentsArray (allArguments, argumentName) {
    var result = [];
    if (!allArguments) return result;

    var i = 0;
    while (i < allArguments.length) {
        if (allArguments[i] === argumentName && i !== allArguments.length - 1) {
            result.push(allArguments[++i]);
        } else {
            ++i;
        }
    }

    return result;
}

/**
 * Removes all options of the passed `allArguments` array that are specified in the `argumentsToBeRemoved` array.
 *
 * @returns {Array<string>} An array with all arguments but excluding the filtered values specified by
 *          `argumentsToBeRemoved`.
 * @param {?Array<string>} allArguments An array containing all CLI arguments.
 * @param {?Array<{name: !string, hasValue: ?boolean}>} argumentsToBeRemoved An array that contains all argument names
 *        that must be removed from the `allArguments` array. If hasValue is set to `true`, the argument is assumed to
 *        have an additional value which will be removed as well.
 */
function removeArgumentsFromArgumentsArray (allArguments, argumentsToBeRemoved) {
    var result = [];
    if (!allArguments) return result;

    var innerArgumentsToBeRemoved = argumentsToBeRemoved || [];
    var i = 0;
    var getCurrentNameToBeRemoved = function (name) {
        var matches = innerArgumentsToBeRemoved.filter(function (n) {
            return n.name === name;
        });
        if (matches.length !== 0 && matches[0].hasValue != null) return matches[0];
        else if (matches.length !== 0) return {name: matches[0].name, hasValue: false};
        else return undefined;
    };
    while (i < allArguments.length) {
        var currentNameToBeRemoved = getCurrentNameToBeRemoved(allArguments[i]);
        if (currentNameToBeRemoved && currentNameToBeRemoved.hasValue) {
            i += 2;
        } else if (currentNameToBeRemoved) {
            ++i;
        } else {
            result.push(allArguments[i++]);
        }
    }

    return result;
}

/**
 * Transforms an array of elements into a list of tuples.
 *
 * @returns {Array<{fst:*, snd:*}>} An array of tuples.
 * @param {Array<*>} lst An array.
 */
function listToTuples (lst) {
    if (!lst) lst = [];

    var result = [];
    var currentElem = {};
    for (var i = 0; i !== lst.length; ++i) {
        if (i % 2 === 0) {
            currentElem.fst = lst[i];
        } else {
            currentElem.snd = lst[i];
            result.push(currentElem);
            currentElem = {};
        }
    }
    return result;
}

/**
 * Removes all tuples from the given list.
 *
 * @returns {Array<*>} A filtered version of ht elist given to this function.
 * @param {Array<*>} allElements The given array that is checkd for sequences of tuples.
 * @param {Array<{fst:*, snd:*}>} tuples A list of tuples to be removed from the given array.
 */
function removeTuplesFromArray (allElements, tuples) {
    var elementsToBeRemoved = [];

    (tuples || []).forEach(function (tuple) {
        for (var i = 0; i !== allElements.length; ++i) {
            if (i !== allElements.length - 1 && allElements[i] === tuple.fst && allElements[i + 1] === tuple.snd) {
                elementsToBeRemoved.push(allElements[i], allElements[i + 1]);
                ++i;
            }
        }
    });

    return allElements.filter(function (elem) {
        return elementsToBeRemoved.indexOf(elem) === -1;
    });
}

/**
 * Transforms the passed values and the passed argument name to an array of argument values, e.g. the value array
 * `['1', '2', '3']` and the argument name '--number' will be transformed to
 * `['--number', '1', '--number', '2', '--number', '3']`.
 *
 * @returns {Array<string>} An array that represents command line arguments.
 * @param {?Array<string>} values The values that will be used as values for the CLI options.
 * @param {!string} argumentName The name of the CLI option.
 */
function valuesToArgumentsArray (values, argumentName) {
    if (!values || values.length === 0) return [argumentName];
    return values.reduce(function (accumulator, currentValue) {
        accumulator.push(argumentName, currentValue);
        return accumulator;
    }, []);
}

/**
 * Check the passed array if it contains a specified tuple or not.
 *
 * @returns {number} The index of the matched tuple. The index indicates where the `tuple.fst` was matched the first
 *          time in the array so that `tuple.snd` was matched as next element in the array.
 * @param {?Array<*>} arr The array that is checked for the tuple.
 * @param {{fst: *, snd: *}} tuple The tuple that is searched in the array.
 * @param {function(*, *): boolean=} comp An optional comparison operator for searching items in the array. The default
 *        is `===`.
 */
function findTuple (arr, tuple, comp) {
    if (!arr || arr.length === 0) return -1;

    var internalComp = comp;
    if (!internalComp) {
        internalComp = function (lft, rgt) {
            return lft === rgt;
        };
    }
    for (var i = 0; i !== arr.length; ++i) {
        if (i < arr.length - 1 && internalComp(arr[i], tuple.fst) && internalComp(arr[i + 1], tuple.snd)) return i;
    }
    return -1;
}

/**
 * Merges two argument arrays into one argument array, by means of copying all values from all passed argument arrays
 * into a new one, so that no duplicates will exist. But no argument value will overwrite the argument value of the
 * other argument array. I.e. in case of `['--js', 'file1.js', '--version']` and `['--debug', '--js', 'file1.js',
 * '--js', 'file2.js']` the result will be `['--js', 'file1.js', '--version', '--debug', '--js', 'file2.js']`.
 *
 * @returns {Array<string>} The merges argument array.
 * @param {?Array<string>} parentArguments The arguments array of the parent configuration.
 * @param {?Array<string>} childArguments The arguments array of the child configuration.
 */
function mergeArguments (parentArguments, childArguments) {
    var innerParentArguments = parentArguments || [];
    var innerChildArguments = childArguments || [];
    var result = innerParentArguments.slice(0);
    var i = 0;
    while (i !== innerChildArguments.length) {
        if (i < innerChildArguments.length - 1 && !innerChildArguments[i + 1].startsWith('--')) {
            var index = findTuple(result, {fst: innerChildArguments[i], snd: innerChildArguments[i + 1]});
            if (index === -1) result.push(innerChildArguments[i], innerChildArguments[i + 1]);
            i += 2;
        } else if (result.indexOf(innerChildArguments[i]) === -1) {
            result.push(innerChildArguments[i++]);
        } else {
            ++i;
        }
    }
    return result;
}

/**
 * Check whether the passed file path refers to a file or not.
 *
 * @returns {QPromise} A pronmise holding a boolean value that indicates whether the passed file path refers to a file
 *          or not.
 * @param {string} filePath The path that is checked.
 */
function isFile (filePath) {
    var deferred = Q.defer();

    fs.stat(filePath, function (err, stats) {
        if (err && /** @type {{code: string}} */ (err).code !== 'ENOENT') deferred.reject(err);
        else if (err) deferred.resolve(false);
        else deferred.resolve(stats.isFile());
    });

    return deferred.promise;
}

/**
 * Check whether the passed file path refers to a folder or not.
 *
 * @returns {QPromise} A promise holding a boolean value that indicates whether the passed directory path refers to a
 *          directory or not.
 * @param {string} directoryPath The path that is checked.
 */
function isDirectory (directoryPath) {
    var deferred = Q.defer();

    fs.stat(directoryPath, function (err, stats) {
        if (err && /** @type {{code: string}} */ (err).code !== 'ENOENT') deferred.reject(err);
        else if (err) deferred.resolve(false);
        else deferred.resolve(stats.isDirectory());
    });

    return deferred.promise;
}

/**
 * Expands the passed glob and returns the resulting file and folder paths.
 *
 * @returns {QPromise} A promise holding an array of file and folder paths.
 * @param {string} globExpression A glob expression.
 */
function expandGlob (globExpression) {
    var deferred = Q.defer();
    glob(globExpression, function (err, filesAndFolders) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(filesAndFolders);
        }
    });

    return deferred.promise;
}

/**
 * Expands the passed glob expressions and returns the resulting file and folder paths.
 *
 * @returns {QPromise} A promise holding an array of file and folder paths.
 * @param {Array<string>} globExpressions A list with glob expressions.
 */
function expandGlobs (globExpressions) {
    return Q.all((globExpressions || []).map(expandGlob))
        .then(flatten);
}

/**
 * Expands the passed glob and returns the resulting file paths that are filtered for files only.
 *
 * @returns {QPromise} A promise holding an array of file paths.
 * @param {string} globExpression A glob expression.
 */
function globFiles (globExpression) {
    return expandGlob(globExpression).then(function (filesAndFolders) {
        return Q.all(filesAndFolders.map(function (filePath) {
            return isFile(filePath).then(function (result) {
                if (result) return filePath;
                return undefined;
            });
        })).then(function (results) {
            return results.filter(function (result) {
                return result !== undefined;
            });
        });
    });
}

/**
 * Expands the passed glob and returns the resulting directory paths that are filtered for directories only.
 *
 * @returns {QPromise} A promise holding an array of file paths.
 * @param {string} globExpression A glob expression.
 */
function globDirectories (globExpression) {
    return expandGlob(globExpression).then(function (filesAndFolders) {
        return Q.all(filesAndFolders.map(function (filePath) {
            return isDirectory(filePath).then(function (result) {
                if (result) return filePath;
                return undefined;
            });
        })).then(function (results) {
            return results.filter(function (result) {
                return result !== undefined;
            });
        });
    });
}

/**
 * Get a list of all files of the given directory and filter the resulting file list for their file extensions.
 *
 * @returns {QPromise} A promise holding an array of file paths.
 * @param {string} directory Paths to the root directories that all files are searched in.
 * @param {Array<string>=} fileExtensions Optional file extensions that are used for filtering the found files. If no value
 *        is given the found files are not filtered for their extension.
 */
function getAllFilesFromDirectory (directory, fileExtensions) {
    var readdirp = function (dir) {
        return isDirectory(dir)
            .then(function (isDir) {
                if (isDir) {
                    return Q.nfcall(fs.readdir, dir).then(function (entries) {
                        return entries.map(function (entry) {
                            return path.join(dir, entry);
                        });
                    });
                } else {
                    return Q.resolve([]);
                }});
    };

    return isFile(directory)
        .then(function (directoryIsFile) {
            if (directoryIsFile) {
                return [directory];
            } else {
                return readdirp(directory).then(function (entries) {
                    return Q.all(entries.map(function (entry) {
                        return isDirectory(entry).then(function (_isDir) {
                            if (_isDir) {
                                return getAllFilesFromDirectory(entry, fileExtensions);
                            } else {
                                return isFile(entry).then(function (_isFile) {
                                    if (_isFile) return entry;
                                    else return undefined;
                                });
                            }
                        });
                    }));
                })
                    .then(flatten)
                    .then(function (files) {
                        return files.filter(function (file) {
                            return file !== undefined;
                        }).filter(function (file) {
                            return !fileExtensions || fileExtensions.length === 0 ||
                                fileExtensions.indexOf(path.extname(file)) !== -1;
                        });
                    });
            }
        });
}

/**
 * Join all paths to the given base path.
 *
 * @return {Array<string>} An array including all the paths that are joined with the given base path.
 *
 * @param {string} basePath The path that is used for all paths as base path for join operations.
 * @param {Array<string>} paths An array of paths that will be joint with the given base path.
 */
function joinPaths (basePath, paths) {
    if (!util.isString(basePath) || basePath.length === 0 || !isStringArray(paths)) {
        if (!isStringArray(paths)) return [];
        else return paths.slice();
    }

    return paths.map(function (p) {
        if (/** @type {{isAbsolute: function(string):boolean}} */ (path).isAbsolute(p)) return p;
        return path.join(basePath, p);
    });
}

/**
 * Flattens an multi-dimensional array into a single-dimensional array.
 *
 * @private
 *
 * @returns {Array<*>} The flattened array.
 * @param {Array<*>} arr A multi-dimensional array.
 */
function flatten (arr) {
    return (arr || []).reduce(function (accumulator, currentElement) {
        var toAppend;
        if (Array.isArray(currentElement)) toAppend = flatten(currentElement);
        else toAppend = currentElement;
        if (!Array.isArray(toAppend)) toAppend = [toAppend];
        Array.prototype.push.apply(accumulator, toAppend);
        return accumulator;
    }, []);
}

/**
 * Get a list of all files of the given directories and filter the resulting file list for their file extensions.
 *
 * @returns {QPromise} A promise holding an array of file paths.
 * @param {Array<string>} directories Paths to the root directories that all files are searched in.
 * @param {Array<string>=} fileExtensions Optional file extensions that are used for filtering the found files. If no value
 *        is given the found files are not filtered for their extension.
 */
function getAllFilesFromDirectories (directories, fileExtensions) {
    return Q.all((directories || []).map(function (directory) {
        return getAllFilesFromDirectory(directory, fileExtensions);
    })).then(function (results) {
        return results.reduce(function (accumulator, currentResult) {
            Array.prototype.push.apply(accumulator, currentResult);
            return accumulator;
        }, []);
    });
}

/**
 * Check whether the containee path is located under the container path.
 *
 * @param {string} container The parent path.
 * @param {string} containee The child path.
 * @return {boolean} `true` in case containee is located in `container`.
 */
function pathIsIn (container, containee) {
    var containerSplits = path.resolve(container).split(path.sep);
    var containeeSplits = path.resolve(containee).split(path.sep);
    if (containerSplits.length > containeeSplits.length) return false;
    for (var i = 0; i !== containerSplits.length; ++i) {
        if (containerSplits[i] !== containeeSplits[i]) return false;
    }
    return true;
}

module.exports.arrayToSet = arrayToSet;
module.exports.isStringArray = isStringArray;
module.exports.mergeArrays = mergeArrays;
module.exports.getValuesFromArgumentsArray = getValuesFromArgumentsArray;
module.exports.removeArgumentsFromArgumentsArray = removeArgumentsFromArgumentsArray;
module.exports.valuesToArgumentsArray = valuesToArgumentsArray;
module.exports.mergeArguments = mergeArguments;
module.exports.findTuple = findTuple;
module.exports.removeTuplesFromArray = removeTuplesFromArray;
module.exports.listToTuples = listToTuples;
module.exports.expandGlob = expandGlob;
module.exports.expandGlobs = expandGlobs;
module.exports.globFiles = globFiles;
module.exports.globDirectories = globDirectories;
module.exports.isFile = isFile;
module.exports.isDirectory = isDirectory;
module.exports.getAllFilesFromDirectory = getAllFilesFromDirectory;
module.exports.getAllFilesFromDirectories = getAllFilesFromDirectories;
module.exports.joinPaths = joinPaths;
module.exports.arrayContains = arrayContains;
module.exports.pathIsIn = pathIsIn;
