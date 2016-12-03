'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Compiler = require('./Compiler.js');

/**
 * The constructor function for {@link CachingCompiler}.
 *
 * @classdesc This class is wrapper for the Google Closure Compiler that additionaly caches previous results. In case a
 *            cached result is available no compilation is required otheriwse the Google Closure Compiler is used to
 *            generate the sources. Finally the JavaScript code is returned as a result.
 *
 * @constructor
 *
 * @extends Compiler
 *
 * @param {!string} cacheFolder A folder path where CCBuild stores all cached content.
 * @throws {Error} Thrown if cacheFolder is not a string or empty.
 */
function CachingCompiler (cacheFolder) { }

util.inherits(CachingCompiler, Compiler);

/**
 * Compiles a compilation unit and returns the JavaScript code as result. In case a cached result is available no
 * compilation is required otheriwse the Google Closure Compiler is used to generate the sources. Finally the JavaScript
 * code is returned as a result.
 *
 * @override
 *
 * @returns {QPromise<Object>} A promise holding the compilation result.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the current compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 */
CachingCompiler.prototype.compile = function (compilationUnit) {
    return null;
};

module.exports = CachingCompiler;
