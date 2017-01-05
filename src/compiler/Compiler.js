'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var utils = require('../utils');

/**
 * @typedef {{workingDirectory: !string,
 *            unitName: !string,
 *            globalSources: !Array<string>,
 *            unitSources: !Array<string>,
 *            globalExterns: !Array<string>,
 *            unitExterns: !Array<string>,
 *            globalBuildOptions: !Array<string>,
 *            unitBuildOptions: !Array<string>,
 *            outputFile: (?string|undefined),
 *            globalWarningsFilterFile: Array<string>,
 *            unitWarningsFilterFile: Array<string>}}
 */
var CompilerConfiguration;

/**
 * @typedef {{code: !number,
 *            stdout: ?string,
 *            stderr: ?string}}
 */
var CompilationResult;

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
 * @returns {QPromise<CompilationResult>} A promise holding the compilation result.
 * @param {!CompilerConfiguration} compilationUnit The compiler configuration for the current compilation unit.
 *
 * @throws {Error} Thrown if compilationUnit is of a wrong type.
 */
Compiler.prototype.compile = function (compilationUnit) { };

/**
 * Transforms the passed unit configuration to a valid configuration for the Closure Compiler.
 *
 * @static
 *
 * @returns {Array<string>} An array of strings that describes all the compiler arguments based on the passed
 *          configuration for the compilation unit.
 * @param {CompilerConfiguration} unitConfiguration An object containing the entire configuration settings for one
 *        compilation unit.
 * @throws {Error} In case the configuration is not valid.
 */
Compiler.getCompilerArguments = function (unitConfiguration) {
    var buildOptions = utils.mergeArguments(unitConfiguration.globalBuildOptions, unitConfiguration.unitBuildOptions);
    var externs = utils.mergeArrays(unitConfiguration.globalExterns, unitConfiguration.unitExterns,
                                    utils.getValuesFromArgumentsArray(buildOptions, '--externs'));
    var sources = utils.mergeArrays(unitConfiguration.globalSources, unitConfiguration.unitSources,
                                    utils.getValuesFromArgumentsArray(buildOptions, '--js'));

    var outputFile = utils.getValuesFromArgumentsArray(buildOptions, '--js_output_file');
    if (outputFile.length !== 0) outputFile.unshift('--js_output_file');
    if (outputFile.length !== 0 && unitConfiguration.outputFile) {
        throw new Error('"--js_output_file" must not be set in "buildOptions" when "outputFile" property is used!');
    }
    if (unitConfiguration.outputFile) outputFile.push('--js_output_file', unitConfiguration.outputFile);
    if (externs.length !== 0) externs = utils.valuesToArgumentsArray(externs, '--externs');
    if (sources.length !== 0) sources = utils.valuesToArgumentsArray(sources, '--js');
    var cleanedBuildOptions =
            utils.removeTuplesFromArray(buildOptions, utils.listToTuples(externs.concat(sources).concat(outputFile)));
    return cleanedBuildOptions.concat(externs).concat(sources).concat(outputFile);
};

module.exports = Compiler;
