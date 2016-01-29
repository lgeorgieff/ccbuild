var Q = {};

/**
 * @constructor
 */
function QDeferred () {};

QDeferred.prototype.reject = function (args) {};

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
 * @returns {*}
 * @param {Array<QDeferred>} promises
 */
Q.allSettled = function(promises) {};
