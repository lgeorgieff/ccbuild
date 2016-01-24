var Q = {};

/**
 * @constructor
 */
function Deferred () {};

Deferred.prototype.reject = function (args) {};

Deferred.prototype.resolve = function (args) {};

/**
 * @returns {Deferred}
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
