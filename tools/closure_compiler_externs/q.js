var Q = {};

/**
 * @constructor
 */
function QDeferred () {};

/**
 * @param {...*} args
 */
QDeferred.prototype.reject = function (args) {};

/**
 * @param {...*} args
 */
QDeferred.prototype.resolve = function (args) {};

/**
 * @type {string}
 */
QDeferred.prototype.state;

/**
 * @type {string}
 */
QDeferred.prototype.reason;

/**
 * @returns {QDeferred}
 */
Q.defer = function () {};

/**
 * @constructor
 */
function QPromise () {};

QPromise.prototype.then = function (args) {};

QPromise.prototype.catch = function (args) {};

/**
 * @returns {QPromise}
 */
Q.promise = function() {};

/**
 * @returns {QPromise}
 * @param {Array<QPromise>} promises
 */
Q.allSettled = function (promises) {};

/**
 * @returns {QPromise}
 * @param {Array<QPromise>} promises
 */
Q.all = function (promises) {};

/**
 * @returns {QPromise}
 * @param {function(...?):?} fn
 * @param {...*} args
 */
Q.nfcall = function (fn, args) {};
