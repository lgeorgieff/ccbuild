'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

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
