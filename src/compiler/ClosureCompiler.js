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
 * The constructor function for {@link ClosureCompiler}.
 *
 * @classdesc This class is a wrapper for the Google Closure Compiler that returns the final JavaScript code.
 *
 * @constructor
 *
 * @extends Compiler
 */
function ClosureCompiler () { }

util.inherits(ClosureCompiler, Compiler);

/**
 * Invokes the Closure Compiler and returns a Promise holding the compilation results.
 *
 * @override
 *
 * @returns {QPromise<Object>} A promise holding the compilation result.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the current compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 */
ClosureCompiler.prototype.compile = function (compilationUnit) {
    return null;
};

module.exports = ClosureCompiler;
