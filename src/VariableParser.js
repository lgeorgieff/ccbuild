/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * @ignore
 * @suppress {duplicate}
 */
var utils = require('./utils.js');

/**
 * @ignore
 * @suppress {duplicate}
 */
var VariableManager = /** @type {function(new:VariableManager)} */ (require('./VariableManager.js'));

/**
 * The regular epxression for a variable reference.
 *
 * @private
 * @const
 * @type {RegExp}
 */
var VARIABLE_EXPRESSION = /\$\{([a-z]|[A-Z]|[0-9]|_|\$)*\}/gm;

/**
 * This class handles the parsing of variable names and replaces them with the value of the variable
 * the is read from the give {@link VariableManager} instance.
 *
 * @constructor
 *
 * @param {VariableManager} variableManager An object that handles variable names to variable values.
 */
function VariableParser (variableManager) {
    if (!(variableManager instanceof VariableManager)) throw new Error('"variableManager" must be a valid instance!');
    this._variableManager = variableManager;
}

/**
 * Replaces all variable occurrences by the actual variable name in the given string.
 *
 * @returns {string} A string where all variable names are replaced by the corresponding values.
 * @param {string} str The original string.
 * @throws {Error} Thrown in case str if not of type string.
 * @throws {Error} Thrown in case a variable name is used that is not defined in the {@link VariableManager} registered
 *         to this instance..
 */
VariableParser.prototype.resolve = function (str) {
    if (!util.isString(str)) throw new Error('"str" must by of type string!');
    var self = this;
    var result = str;
    var identifiers = str.match(VARIABLE_EXPRESSION) || [];
    identifiers.forEach(function (identifier) {
        result = result.replace(identifier, self._variableManager.get(self._referenceToName(identifier)));
    });
    return result;
};

/**
 * Transform a variable reference to a variable name.
 *
 * @private
 *
 * @returns {string} A variable name with out the leading "${" and trailing "}".
 * @param {string} reference A variable reference with the leading "${" and trailing "}".
 * @throws {Error} Thrown in case reference is not a string or has a length < 3.
 */
VariableParser.prototype._referenceToName = function (reference) {
    if (!util.isString(reference) || reference.length < 3) {
        throw new Error('"reference" must be a string with a length >= 3!');
    }
    return reference.substring(2, reference.length - 1);
};

module.exports = VariableParser;
