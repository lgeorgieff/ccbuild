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
var util = require('util');

/**
 * This module wide variable is used to indicate whether an compilation error occurred for one of the compilation units
 * or not. In case a compilation error occurred, this variable is used to use the exit code 1 when quitting this script.
 *
 * @private
 *
 * @type {boolean}
 */
var compilationErrorDetected = false;

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
 * The entry point of this script.
 *
 * @private
 */
function main () {
    var parsedCliArgs = {};
    var ccbuild = new CCBuild(process.argv);
    ccbuild.on('argsError', function (err) {
        utils.getSelfName().then(function (selfName) {
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
        compilationErrorDetected = true;
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
        if (parsedCliArgs.args.stopOnWarning) process.exit(1);
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

    process.on('exit', function () {
        process.exitCode = Number(compilationErrorDetected);
    });
}

main();
