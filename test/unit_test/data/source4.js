var prefixPrintFn = /** @type {function(string, Array<string>) } */ (require('./source1'));

var toUpperCaseFn = /** @type {function(string): string} */ (require('./source3'));

/**
 * @param {string} prefix
 * @param {Array<string>} messages
 */
let upperCasePrefixPrint = (prefix, messages) => {
    prefixPrintFn(toUpperCaseFn(prefix), messages);
};

module.exports = upperCasePrefixPrint;
