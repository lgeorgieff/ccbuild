#!/usr/bin/env node

/**
 * @ignore
 * @suppress {duplicate}
 */
var path = require('path');

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
var utils = require('./utils');

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * @ignore
 * @suppress {duplicate}
 */
var configReader = require('./config_reader');

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
 * Get the usage text.
 *
 * @private
 *
 * @returns {Promise<string>} A promise that holds the usage text as a string value.
 */
function getUsage () {
    var deferred = Q.defer();
    utils.getSelfName().then(function (selfName) {
        deferred.resolve(
            'Usage: ' + selfName + ' [-h|--help] [-v|--version] [--closure-help]\n' +
                '           [--closure-version] [--compiler-path] [--contrib-path]\n' +
                '           [-c|--config PATH]... [--config-help]\n\n' +
                'Checks and compiles JavaScript files via the Closure Compiler.\n\n' +
                '  -h|--help           Display this message and exit.\n' +
                '  -v|--version        Display version information and exit.\n' +
                '  --closure-help      Display the usage for the Closure Compiler and exit.\n' +
                '  --closure-version   Display the version of the Closure Compiler and exit.\n' +
                '  --compiler-path     Display the path to the Closure Compiler and exit.\n' +
                '  --contrib-path      Display the path to the contrib directory of the\n' +
                '                      Closure Compiler and exit.\n' +
                '  -c|--config PATH    Path to the configuration file ' + selfName + ' should\n' +
                '                      use. If no configuration is specified ' + selfName + '\n' +
                '                      checks the current directory for all files with the file\n' +
                '                      extension ".nbuild". For every matched configuration file\n' +
                '                      ' + selfName + ' performs a run.\n' +
                ' --config-help        Display a help message for the configuration file format\n' +
                '                      and exit.\n');
    }).catch(deferred.reject);
    return deferred.promise;
}

/**
 * Get a help text for the configuration file.
 *
 * @private
 *
 * @returns {Promise<string>} A promise that holds the help text for the config file format as a string value.
 */
function getConfigFileHelp () {
    var deferred = Q.defer();
    utils.getSelfName().then(function (selfName) {
        deferred.resolve(
            'The configuration files for ' + selfName + ' use the JSON format and are of the\n' +
                'following form:\n\n' +
                '{\n' +
                '  "sources": [<source file paths to be included in all compilation units defined in this config>],\n' +
                '  "externs": [<extern file paths to be included in all compilation units defined in this config>],\n' +
                '  "buildOptions": [<options to be used for all compilation units defined in this config>],\n' +
                '  "compilationUnits": {\n' +
                '    "unit 1": {\n' +
                '      "externs": [<source file paths to be used only for this compilation unit>],\n' +
                '      "sources": [<extern file paths to be used only for this compilation unit>],\n' +
                '      "buildOptions": [<options to be used only for this compilation unit>]\n' +
                '    },\n' +
                '    "unit 2": {\n' +
                '      "externs": [<source file paths to be used only for this compilation unit>],\n' +
                '      "sources": [<extern file paths to be used only for this compilation unit>],\n' +
                '      "buildOptions": [<options to be used only for this compilation unit>]\n' +
                '    },\n' +
                '  }\n' +
                '  "next": {\n' +
                '    "file path to the next config relative to this config": {\n' +
                '      "inheritSources": <boolean>,\n' +
                '      "inheritExterns": <boolean>,\n' +
                '      "inheritBuildOptions": <boolean>\n' +
                '    }\n' +
                '    "file path to another config relative to this config": {\n' +
                '      "inheritSources": <boolean>,\n' +
                '      "inheritExterns": <boolean>,\n' +
                '      "inheritBuildOptions": <boolean>\n' +
                '    }\n' +
                '  }\n' +
                '}\n\n' +
                'Note: buildOptions can be either an array of strings or an object as specified\n' +
                'at https://www.npmjs.com/package/google-closure-compiler#specifying-options.');
    }).catch(deferred.reject);
    return deferred.promise;
}

/**
 * Parse all CLI arguments and return an object with the corresponding properties.
 * In case of error, the script exits with exit code 2. Some properties, e.g. --version lead to an exit with exit code 0.
 *
 * @private
 *
 * @returns {Promise<Object>} A promise containing an object with all parsed properties.
 * @param {Array<string>} args An array with all CLI arguments.
 */
function parseCliArgs (args) {
    var deferred = Q.defer();

    var result = {};
    var i = 2;
    var printFromPromiseAndExit = function (promise) {
        promise().then(function (toBePrinted) {
            console.log(toBePrinted);
            process.exit(0);
        }).catch(function (err) {
            deferred.reject(err);
        });
        i = args.length;
    };
    for (; i < args.length; ++i) {
        switch (args[i]) {
        case '--help':
        case '-h':
            printFromPromiseAndExit(getUsage);
            break;
        case '--version':
        case '-v':
            printFromPromiseAndExit(utils.getSelfVersion);
            break;
        case '--config':
        case '-c':
            if (i + 1 === args.length) {
                deferred.reject(new Error('-c|--config requires a PATH parameter'));
            } else {
                if (!result.hasOwnProperty('configs')) result.configs = [];
                result.configs.push(path.resolve(args[++i]));
            }
            break;
        case '--config-help':
            printFromPromiseAndExit(getConfigFileHelp);
            break;
        case '--closure-help':
            printFromPromiseAndExit(utils.getCCHelp);
            break;
        case '--closure-version':
            printFromPromiseAndExit(utils.getCCVersion);
            break;
        case '--compiler-path':
            console.log(CC.compiler.COMPILER_PATH);
            process.exit(0);
            break;
        case '--contrib-path':
            console.log(CC.compiler.CONTRIB_PATH);
            process.exit(0);
            break;
        default:
            deferred.reject('The option "' + args[i] + '" is not supported');
            i = args.length;
            break;
        }
    }
    if (result.configs !== undefined) result.configs = utils.arrayToSet(result.configs);
    deferred.resolve(result);
    return deferred.promise;
}

/**
 * Invokes the Closure Compiler with the passed arguments. All global and local settings are merged and passed as merged
 * arguments to the Closure Compiler.
 *
 * @private
 *
 * @returns {Promise<{stdout: string, stderr: string}>} A promise holding the stderr and stdout of the compilation
 *          process.
 *
 * @param {CompilerConfiguration} compilerConfiguration An objet that contains the compiler configuration for a
 *        particular compilation unit.
 */
function compile (compilerConfiguration) {
    var deferred = Q.defer();
    var compilerArguments = configReader.getCompilerArguments(compilerConfiguration);
    var compiler = new CC.compiler(compilerArguments);
    compiler.run(function (code, stdout, stderr) {
        if (code !== 0) {
            var err = new Error(code + (stderr ? ': ' + stderr : ''));
            deferred.reject(err);
        } else {
            deferred.resolve({stdout: stdout + '\n', stderr: stderr});
        }
    });
    return deferred.promise;
}

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
 * Invokes the compilation process for each configuration file specified via the CLI and via the next property in the
 * configuration files themselves.
 *
 * @private
 *
 * @param {{configs: Array<string>}} cliArgs An object containing all CLI arguments.
 */
function processConfigs (cliArgs) {
    var processedConfigFiles = [];
    /**
     * @private
     *
     * @param {string} configFilePath The file path of the configuration file to be processed.
     * @param {Object=} parentConfig The parsed parent configuration - if present.
     */
    var processConfig = function (configFilePath, parentConfig) {
        // We ignore duplicate configuration files. This can be for example the case if the same configuration file is
        // specified viw the CLI argument --config|-c and vie the next property in a parent configuration file.
        if (processedConfigFiles.indexOf(configFilePath) === -1) {
            configReader.readAndParseConfiguration(configFilePath, parentConfig).then(function (configObject) {
                process.chdir(path.dirname(configFilePath));
                Object.keys(configObject.compilationUnits).forEach(function (compilationUnit) {
                    compile({
                        unitName: compilationUnit,
                        globalSources: configObject.sources,
                        unitSources: configObject.compilationUnits[compilationUnit].sources,
                        globalExterns: configObject.externs,
                        unitExterns: configObject.compilationUnits[compilationUnit].externs,
                        globalBuildOptions: configObject.buildOptions,
                        unitBuildOptions: configObject.compilationUnits[compilationUnit].buildOptions
                    }).then(function (output) {
                        console.log(getHeading(compilationUnit));
                        console.log(output.stdout);
                        if (output.stderr) {
                            console.error(output.stderr);
                        }
                    }).catch(function (err) {
                        console.log(getHeading(compilationUnit));
                        console.error(err);
                        compilationErrorDetected = true;
                    });
                });
                processedConfigFiles.push(configFilePath);
                Object.keys(configObject.next).forEach(function (nextConfigFilePath) {
                    processConfig(nextConfigFilePath, configObject);
                });
            }).catch(function (err) {
                console.error(err);
                process.exit(1);
            });
        } else {
            console.error('Discovered circular dependency to "' + configFilePath + '"!');
        }
    };

    cliArgs.configs.forEach(function (configFilePath) {
        processConfig(configFilePath);
    });
}

/**
 * The entry point of this script.
 *
 * @private
 */
function main () {
    parseCliArgs(process.argv).then(function (cliArgs) {
        if (cliArgs.configs) {
            processConfigs(/** @type {{configs: Array<string>}} */ (cliArgs));
        } else {
            configReader.getLocalConfigFiles().then(function (configFiles) {
                cliArgs.configs = configFiles;
                processConfigs(/** @type {{configs: Array<string>}} */ (cliArgs));
            });
        }
    }).catch(function (err) {
        utils.getSelfName().then(function (selfName) {
            console.error(err + '\n');
            console.error('For more information call ' + selfName + ' --help');
            process.exit(2);
        }).catch(function (err) {
            console.error(err);
            process.exit(2);
        });
    });

    process.on('exit', function () {
        process.exitCode = Number(compilationErrorDetected);
    });
}

main();
