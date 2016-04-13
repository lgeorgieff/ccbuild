'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * A class that manages variable names and values.
 *
 * @constructor
 *
 * @param {VariableManager=} source An optional parameter that can be used as basic set of variables for the created
 *        VariableManager instance. I.e. all variables of the passed VariableManager are copied into the new one.
 * @throws {Error} Thrown in case source is not of type VariableManager.
 */
function VariableManager (source) {
    /**
     * Contains a maaping of variable names and variable values.
     *
     * @type {Object<string, string>}
     */
    this._variables = {};

    if (source && !(source instanceof VariableManager)) {
        throw new Error('"source" must be of type "VariableManager"!');
    } else if (source) {
        for (var key in source._variables) {
            this._variables[key] = source._variables[key];
        }
    }
}

/**
 * Set a value to the given variable name that is manages by this class.
 *
 * @param {string} variableName The name of the variable that will hold the given value.
 * @param {string} variableValue The value of the variable with the gieven name.
 * @throws {Error} Thrown in case the variableName is an empty string.
 * @throws {Error} Thrown in case variableName is not of type string.
 * @throws {Error} Thrown in case variableValue is not of type string.
 */
VariableManager.prototype.set = function (variableName, variableValue) {
    if (!util.isString(variableName)) throw new Error('"variableName" must be of type string!');
    if (!util.isString(variableValue)) throw new Error('"variableValue" must be of type string!');
    if (variableName.length === 0) throw new Error('"variableName" must not be ""!');
    this._variables[variableName] = variableValue;
};

/**
 * Get a value bound to a particular variable name.
 *
 * @param {string} variableName The name of the variable of which the value will be returned.
 * @throws {Error} Thrown in case the variableName does not exist.
 * @throws {Error} Thrown in case variableName is not of type string.
 */
VariableManager.prototype.get = function (variableName) {
    if (!util.isString(variableName)) throw new Error('"variableName" must be of type string!');
    if (!this.has(variableName)) throw new Error('The variable name "' + variableName + '" is not defined!');
    return this._variables[variableName];
};

/**
 * Check whether a variable with a given variable name exists.
 *
 * @returns {boolean} `true` in case a variable with the name `variableName` exists. `false` otherwise.
 *
 * @param {string} variableName The name of the variable that this manager is searched for.
 * @throws {Error} Thrown in case variableName is not of type string.
 */
VariableManager.prototype.has = function (variableName) {
    if (!util.isString(variableName)) throw new Error('"variableName" must be of type string!');
    return Object.prototype.hasOwnProperty.call(this._variables, variableName);
};

module.exports = VariableManager;
