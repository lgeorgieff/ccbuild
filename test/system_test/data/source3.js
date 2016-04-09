/**
 * @ignore
 * @suppress {duplicate}
 */
var externs3 = require('./externs3');

/**
 * @returns {string}
 *
 * @param {string} str
 */
function toUpperCase (str) {
    return str.toUpperCase();
}

/**
 * @returns {*}
 */
function magicFunction () {
    var magic = externs3.generate();
    var moreMagic = externs3.transform(magic);
    return moreMagic * moreMagic;
}

module.exports.toUpperCase = toUpperCase;
module.exports.magicFunction = magicFunction;
