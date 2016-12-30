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
var CC = require('google-closure-compiler');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Q = require('q');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Compiler = /** @type {function(new:Compiler): undefined} */ (require('./Compiler.js'));

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
 * @returns {QPromise<CompilationResult>} A promise holding the compilation result.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the current compilation unit.
 *
 * @throws {Error} In case the configuration of the compilation unit is not valid.
 */
ClosureCompiler.prototype.compile = function (compilationUnit) {
    var compilerArguments = Compiler.getCompilerArguments(compilationUnit);
    var compiler = new CC.compiler(compilerArguments);

    var deferred = Q.defer();
    compiler.run(function (code, stdout, stderr) {
        deferred.resolve({code: code, stdout: stdout, stderr: stderr});
    });

    return deferred.promise;
};

module.exports = ClosureCompiler;
