'use strict';

/**
 * The constructor function for {@link Compiler}.
 *
 * @classdesc This class is an abstract base class for a compiler that returns the final JavaScript code.
 *
 * @constructor
 *
 * @throws {Error} Thrown if this class gets instaniated.
 */
function Compiler () { }

/**
 * Invokes the Closure Compiler and returns a Promise holding the compilation results.
 *
 * @virtual
 *
 * @returns {QPromise<Object>} A promise holding the compilation result.
 * @param {CompilerConfiguration} compilationUnit The compiler configuration for the current compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 */
Compiler.prototype.compile = function (compilationUnit) { };

module.exports = Compiler;
