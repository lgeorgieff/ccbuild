#!/usr/bin/env node

'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var CCBuild = /** @type {function (new:CCBuild, (Array<string>))} */ (require('./CCBuild.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var CCFileCheck = /** @type {function (new:CCFileCheck, (Array<string>))} */ (require('./CCFileCheck.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var CLI = /** @type {function (new:CLI, (Array<string>))} */ (require('./CLI.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * This module wide variable is used to indicate whether an error occurred for one of the compilation units or the
 * configuraton files. In case an error occurred, this variable is used to use the exit code 1 when quitting this script.
 *
 * @private
 *
 * @type {boolean}
 */
var errorDetected = false;

/**
 * Generate a heading line for a compilation unit.
 *
 * @private
 *
 * @returns {string} The heading line for a compilation unit.
 * @param {string} unitName The name of the compilation unit the generated heading will be used for.
 * @param {number=} maxLength An optional maximum length of the line. The default is 79.
 */
function getHeading (unitName, maxLength) {
    var result = '=== ' + unitName + ' ===';
    var maximumLength = 79;
    if (util.isNumber(maxLength)) maximumLength = maxLength;
    while (result.length < maximumLength) result += '=';
    return result;
}

/**
 * Compile all compilation units from the given configuration files.
 *
 * @private
 *
 * @param {Array<string>} cliArguments All CLI arguments that are used during the command line invocation for this
 *        script.
 */
function compile (cliArguments) {
    var parsedCliArgs = {};
    var ccbuild = new CCBuild(cliArguments);
    ccbuild.on('argsError', function (err) {
        CLI.getSelfName().then(function (selfName) {
            console.error(err + '\n');
            console.error('For more information call ' + selfName + ' --help');
            process.exit(2);
        }).catch(function (err) {
            console.error(err);
            process.exit(2);
        });
    });
    ccbuild.on('compilerPath', function (compilerPath) {
        console.log(compilerPath);
        process.exit(0);
    });
    ccbuild.on('contribPath', function (contribPath) {
        console.log(contribPath);
        process.exit(0);
    });
    ccbuild.on('argsParsed', function (parsedArgs) {
        parsedCliArgs.args = parsedArgs;
    });
    ccbuild.on('configError', function (err) {
        console.error(err);
        process.exit(1);
    });
    ccbuild.on('circularDependencyError', function (err) {
        console.error(err);
    });
    ccbuild.on('compilationError', function (compilationUnit, err) {
        errorDetected = true;
        if (!parsedCliArgs.args.ignoreErrors) {
            console.error(getHeading(compilationUnit));
            console.error(err);
        }
        if (parsedCliArgs.args.stopOnError) process.exit(1);
    });
    ccbuild.on('compiled', function (compilationUnit, stdout, stderr) {
        if (!parsedCliArgs.args.ignoreCompiledCode || (!parsedCliArgs.args.ignoreWarnings && stderr)) {
            console.log(getHeading(compilationUnit));
        }
        if (!parsedCliArgs.args.ignoreCompiledCode) {
            console.log(stdout + '\n');
        }
        if (!parsedCliArgs.args.ignoreWarnings && stderr) {
            console.error(stderr);
        }
        if (parsedCliArgs.args.stopOnWarning && stderr) {
            errorDetected = true;
            process.exit(1);
        }
    });

    var printAndExit = function (message) {
        console.log(message);
        process.exit(0);
    };
    ccbuild.on('help', printAndExit);
    ccbuild.on('version', printAndExit);
    ccbuild.on('configHelp', printAndExit);
    ccbuild.on('closureHelp', printAndExit);
    ccbuild.on('closureVersion', printAndExit);
}

/**
 * Checks whether the specifed files in the configuration files are included in any compilation unit or not.
 *
 * @private
 *
 * @param {Array<string>} cliArguments All CLI arguments that are used during the command line invocation for this
 *        script.
 */
function checkFiles (cliArguments) {
    var parsedCliArgs = {};
    var ccfc = new CCFileCheck(cliArguments);

    ccfc.on('argsParsed', function (parsedArgs) {
        parsedCliArgs.args = parsedArgs;
    });

    ccfc.on('verificationError', function (filePath, configFilePath) {
        errorDetected = true;
        if (!parsedCliArgs.args.ignoreErrors) {
            console.error('The file "' + filePath + '" is not included in any of the compilation units defined in "' +
                          configFilePath + '"!');
        }
        if (parsedCliArgs.args.stopOnError) process.exit(1);
    });

    ccfc.on('error', function (err) {
        errorDetected = true;
        if (!parsedCliArgs.args.ignoreErrors) {
            console.error(err);
        }
        if (parsedCliArgs.args.stopOnError) process.exit(1);
    });
}

/**
 * The entry point of this script.
 *
 * @private
 */
function main () {
    compile(process.argv);
    checkFiles(process.argv);

    process.on('exit', function () {
        process.exitCode = Number(errorDetected);
    });
}

main();
