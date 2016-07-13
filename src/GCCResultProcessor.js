'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var GCCMessage = /** @type {function (new:GCCMessage, string)} */ (require('./GCCMessage.js'));

/**
 * Contructor function for the type {@link GCCResultProcessor}.
 *
 * @classdesc This class process stdout and stderr from the Google Closure Compiler into {@link GCCMessage} objects.
 *            In addition several helper methods are offered.
 *
 * @constructor
 *
 * @param {number} code The return code of the GCC.
 * @param {string} stdout The results from GCC on stdout.
 * @param {string} stderr The results from GCC on stderr
 */
function GCCResultProcessor (code, stdout, stderr) {
    this._code = code;
    this._stdout = stdout;
    this._stderr = stderr;
    this._results = /** @type {Array<GCCMessage>} */ (/** @type {?} */(undefined));
    this._processStderr();
}

/**
 * A getter for the return code of the GCC process.
 *
 * @returns {number} The return code of the GCC process.
 */
GCCResultProcessor.prototype.getCode = function () {
    return this._code;
};

/**
 * A getter for the compiled source code returned by GCC - mainly the content of stdout.
 *
 * @returns {string} The compiled code returned by GCC.
 */
GCCResultProcessor.prototype.getCompiledCode = function () {
    if (this.hasCompiledCode()) return this._stdout;
    else return '';
};

/**
 * Check whether compiled source code exists or not.
 *
 * @returns {boolean} `true` in case compiled source code exists. `false` otherwise.
 */
GCCResultProcessor.prototype.hasCompiledCode = function () {
    return this._code === 0 && this._stdout.trim().length !== 0;
};

/**
 * Check whether compilation warnings exist or not.
 *
 * @returns {boolean} `true` in case compilation warnings exist. `false` otherwise.
 */
GCCResultProcessor.prototype.hasWarnings = function () {
    return this._results.some(function (item) {
        return item.isWarning();
    });
};

/**
 * Check whether compilation errors exist or not.
 *
 * @returns {boolean} `true` in case compilation errors exist. `false` otherwise.
 */
GCCResultProcessor.prototype.hasErrors = function () {
    return this._results.some(function (item) {
        return item.isError();
    });
};

/**
 * A getter for all messages that represent compilation errors.
 *
 * @returns {Array<GCCMessage>} A list of compilation errors.
 */
GCCResultProcessor.prototype.getErrors = function () {
    return this._results.filter(function (item) {
        return item.isError();
    });
};

/**
 * A getter for all messages that represent compilation warnings.
 *
 * @returns {Array<GCCMessage>} A list of vompilation warnings.
 */
GCCResultProcessor.prototype.getWarnings = function () {
    return this._results.filter(function (item) {
        return item.isWarning();
    });
};

/**
 * A getter for the message object that represents the status line.
 *
 * @returns {GCCMessage|null} The status message object or null if no status message is existing.
 */
GCCResultProcessor.prototype.getStatusLine = function () {
    var statusLines = this._results.filter(function (item) {
        return item.isStatus();
    });
    if (statusLines.length === 0) return null;
    else return statusLines[0];
};

/**
 * A helper method that does the actual transformation from stderr to a collection of {@link GCCMessage} objects.
 *
 * @private
 *
 * @returns {Array<GCCMessage>} A collection of {@link GCCMessage} objects that represent stderr.
 */
GCCResultProcessor.prototype._processStderr = function () {
    if (this._results) return this._results;
    if (this._stderr.length === 0) {
        this._results = [];
    } else {
        this._results = this._stderr.split('\n\n')
            .map(function (entry) {
                return new GCCMessage(entry);
            });
    }

    return this._results;
};

/**
 * Get all processed results from stderr.
 *
 * @returns {Array<GCCMessage>} A collection of all {@link GCCMessage} objects that represent stderr.
 */
GCCResultProcessor.prototype.getResults = function () {
    return this._results.slice();
};

module.exports = GCCResultProcessor;
