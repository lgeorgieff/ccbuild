'use strict';

var source1 = /** @type {function(Array<string>)} */ (require('./source1'));

/**
 * @param {string} prefix
 * @param {Array<string>} messages
 */
let prefixPrint = (prefix, messages) => {
    source1((messages || []).map((message) => `${prefix}message`));
    var abc = 1, def = 2;
    abc + def;
};

module.exports = prefixPrint;
