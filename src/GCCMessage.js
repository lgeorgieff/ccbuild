'use strict';

/**
 * @const
 */
var STATUS_REGEX = /([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typedg/;

/**
 * @const
 */
var ERROR_REGEX = /.+:[0-9]+: ERROR - .+/;

/**
 * @const
 */
var WARNING_REGEX = /.+:[0-9]+: WARNING - .+/;

/**
 * Contructor function for the type {@link GCCMessage}.
 *
 * @classdesc This class represents one entry of the Google Closure Compiler's output on stderr like warnigns and
 *            errors.
 *
 * @constructor
 *
 * @param {string} message One single message of the GCC (may be a multi line message).
 */
function GCCMessage (message) {
    this._data = (message || '').split('\n').filter(function (line) {
        return line.length !== 0;
    });
}

/**
 * Check whether this message has a headline of the form <source file>:<line number>: <WARNING|ERROR> - <error id>.
 *
 * @returns {boolean} `true` in case a heading is part of this message. `false` otherwise.
 */
GCCMessage.prototype.hasHeading = function () {
    return this._data.length > 1;
};

/**
 * Get the headline of the form <source file>:<line number>: <WARNING|ERROR> - <error id> from this message.
 *
 * @returns {string|null} A string in case a headline exists. `null` otherwise.
 */
GCCMessage.prototype.getHeading = function () {
    if (this.hasHeading()) return this._data[0];
    else return null;
};

/**
 * Check whether this message has a message body. A message body is all content that follows the headline.
 *
 * @returns {boolean} `true` in case a message body is part of this message. `false` otherwise.
 */
GCCMessage.prototype.hasMessage = function () {
    return this._data.length > 1;
};

/**
 * Get the message body from this message. A message body is all content that follows the headline.
 *
 * @returns {string|null} A string in case a message body exists. `null` otherwise.
 */
GCCMessage.prototype.getMessage = function () {
    if (this.hasMessage()) return this._data.splice(1).join('\n');
    else return null;
};

/**
 * Check whether this message is an error message.
 *
 * @returns {boolean} `true` in case this message is an error message. `false` otherwise.
 */
GCCMessage.prototype.isError = function () {
    return this.hasHeading() && this._data[0].search(ERROR_REGEX) !== -1;
};

/**
 * Check whether this message is a warning message.
 *
 * @returns {boolean} `true` in case this message is a warning message. `false` otherwise.
 */
GCCMessage.prototype.isWarning = function () {
    return this.hasHeading() && this._data[0].search(WARNING_REGEX) !== -1;
};

/**
 * Check whether this message is a status message.
 *
 * @returns {boolean} `true` in case this message is a status message. `false` otherwise.
 */
GCCMessage.prototype.isStatus = function () {
    return this._data.length === 1 && this._data[0].search(STATUS_REGEX) !== -1;
};

/**
 * Get the status line of this message. The status line is of the form
 * ([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typed.
 *
 * @returns {string} The status line.
 * @throws {Error} Thrown in case this message object is not a status message.
 */
GCCMessage.prototype.getStatus = function () {
    if (this.isStatus()) return this._data[0];
    throw new Error('Cannot get the status line. ' + this + ' is not a status message!');
};

/**
 * Get the errors count of the status line of this message. The status line is of the form
 * ([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typed.
 *
 * @returns {number} The errors count of the status line.
 * @throws {Error} Thrown in case this message object is not a status message.
 */
GCCMessage.prototype.getErrorsCount = function () {
    if (!this.isStatus()) throw new Error('Cannot get an error count. ' + this + ' is not a status message!');
    let result = this._data[0].match(STATUS_REGEX);
    if (result && result[1] !== undefined) return parseInt(result[1], 10);
    return -1;
};

/**
 * Get the warnings count of the status line of this message. The status line is of the form
 * ([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typed.
 *
 * @returns {number} The warnings count of the status line.
 * @throws {Error} Thrown in case this message object is not a status message.
 */
GCCMessage.prototype.getWarningsCount = function () {
    if (this.isStatus()) {
        let result = this._data[0].match(STATUS_REGEX);
        if (result && result[2] !== undefined) return parseInt(result[2], 10);
        return -1;
    }
    throw new Error('Cannot get a warnings count. ' + this + ' is not a status message!');
};

/**
 * Get the filtered warnings count of the status line of this message. The status line is of the form
 * ([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typed.
 *
 * @returns {number} The filtered warnings count of the status line.
 * @throws {Error} Thrown in case this message object is not a status message.
 */
GCCMessage.prototype.getFilteredWarningsCount = function () {
    if (!this.isStatus()) {
        throw new Error('Cannot get an filtered warnings count. ' + this + ' is not a status message!');
    }
    let result = this._data[0].match(STATUS_REGEX);
    if (result && result[4] !== undefined) return parseInt(result[4], 10);
    return -1;
};

/**
 * Get the typed ratio of the status line of this message. The status line is of the form
 * ([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typed.
 *
 * @returns {string|null} The typed ratio of the status line.
 * @throws {Error} Thrown in case this message object is not a status message.
 */
GCCMessage.prototype.getTypedRatio = function () {
    if (!this.isStatus()) {
        throw new Error('Cannot get typed ratio. ' + this + ' is not a status message!');
    }
    let result = this._data[0].match(STATUS_REGEX);
    if (result && result[5] !== undefined) return result[5];
    return null;
};

/**
 * Set the errors count of the status line of this message. The status line is of the form
 * ([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typed.
 *
 * @param {number} value The new errors count of the status line.
 * @throws {Error} Thrown in case this message object is not a status message or has a bad format.
 */
GCCMessage.prototype.setErrorsCount = function (value) {
    if (!this.isStatus()) throw new Error('Cannot set an error count. ' + this + ' is not a status message!');
    var warningsCount = this.getWarningsCount();
    var filteredWarningsCount = this.getFilteredWarningsCount();
    var typedRatio = this.getTypedRatio();
    if (warningsCount === -1 || typedRatio === null) {
        throw new Error('Cannot set an error count. ' + this + ' has a bad format!');
    }
    if (filteredWarningsCount === -1) filteredWarningsCount = 0;
    this._setStatusLine(value, warningsCount, filteredWarningsCount, typedRatio);
};

/**
 * Set the warnings count of the status line of this message. The status line is of the form
 * ([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typed.
 *
 * @param {number} value The new warnings count of the status line.
 * @throws {Error} Thrown in case this message object is not a status message or has a bad format.
 */
GCCMessage.prototype.setWarningsCount = function (value) {
    if (!this.isStatus()) throw new Error('Cannot set an error count. ' + this + ' is not a status message!');
    var errorsCount = this.getErrorsCount();
    var filteredWarningsCount = this.getFilteredWarningsCount();
    var typedRatio = this.getTypedRatio();
    if (errorsCount === -1 || typedRatio === null) {
        throw new Error('Cannot set a warnings count. ' + this + ' has a bad format!');
    }
    if (filteredWarningsCount === -1) filteredWarningsCount = 0;
    this._setStatusLine(errorsCount, value, filteredWarningsCount, typedRatio);
};

/**
 * Set the filtered warnings count of the status line of this message. The status line is of the form
 * ([0-9]+) error\(s\), ([0-9]+) warning\(s\)(, ([0-9]+) filtered warning\(s\))?, ([0-9]+\.[0-9]+)% typed.
 *
 * @param {number} value The new filtered warnings count of the status line.
 * @throws {Error} Thrown in case this message object is not a status message or has a bad format.
 */
GCCMessage.prototype.setFilteredWarningsCount = function (value) {
    if (!this.isStatus()) throw new Error('Cannot set an error count. ' + this + ' is not a status message!');
    var errorsCount = this.getErrorsCount();
    var warningsCount = this.getWarningsCount();
    var filteredWarningsCount = this.getFilteredWarningsCount();
    var typedRatio = this.getTypedRatio();
    if (errorsCount === -1 || warningsCount === -1 || typedRatio === null) {
        throw new Error('Cannot set a warnings count. ' + this + ' has a bad format!');
    }
    this._setStatusLine(errorsCount, warningsCount, value, typedRatio);
};

/**
 * A helper function that sets the status line of this message in case this is a status message.
 *
 * @private
 *
 * @param {number} errorsCount The number of errors that were found by the GCC.
 * @param {number} warningsCount The number of warnings that were found by the GCC.
 * @param {number} filteredWarningsCount The number of filtered warnings that were filtered out by the warnings flter
 *        file.
 * @param {string} typedRatio The value for the typed code ratio that is shown by the GCC.
 * @throws {Error} Thrown in case this message is not a status message.
 */
GCCMessage.prototype._setStatusLine = function (errorsCount, warningsCount, filteredWarningsCount, typedRatio) {
    if (!this.isStatus) throw new Error('Cannot set an error count. ' + this + ' is not a status message!');
    this._data[0] = errorsCount + ' error(s), ' + warningsCount + ' warning(s), ' + filteredWarningsCount +
        ' filtered warning(s), ' + typedRatio + '% typed';
};

/**
 * Transform this message object into its string representation.
 *
 * @returns {string} The string representation of this message object.
 */
GCCMessage.prototype.toString = function () {
    if (this._data && this._data.length) {
        return this._data.join('\n') + '\n';
    } else {
        return '';
    }
};

/**
 * Transforms a collection of messages into a string.
 *
 * @returns {string} The string representation of the message collection.
 * @param {Array<GCCMessage>} messages The messages that will be serialized into a string.
 */
GCCMessage.messagesToString = function (messages) {
    if (!messages || !messages.length) return '';
    else return messages.join('\n') + '\n';
};

module.exports = GCCMessage;
