'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var path = require('path');

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * @ignore
 * @suppress {duplicate}
 */
var events = require('events');

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
var async = require('async');

/**
 * @ignore
 * @suppress {duplicate}
 */
var utils = require('./utils');

/**
 * @ignore
 * @suppress {duplicate}
 */
var configReader = require('./configReader');

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
                '           [--config-help] [--closure-version] [--compiler-path]\n' +
                '           [--contrib-path] [--ignore-warnings] [-ignore-errors]\n' +
                '           [-c|--config PATH]... [--ignore-compiled-code] [--stop-on-error]\n' +
                '           [--stop-on-warning]\n\n' +
                'Checks and compiles JavaScript files via the Closure Compiler.\n\n' +
                '  -h|--help               Display this message and exit.\n' +
                '  -v|--version            Display version information and exit.\n' +
                '  --closure-help          Display the usage for the Closure Compiler and exit.\n' +
                '  --closure-version       Display the version of the Closure Compiler and exit.\n' +
                '  --compiler-path         Display the path to the Closure Compiler and exit.\n' +
                '  --contrib-path          Display the path to the contrib directory of the\n' +
                '                          Closure Compiler and exit.\n' +
                '  -c|--config PATH        Path to the configuration file ' + selfName + ' should\n' +
                '                          use. If no configuration is specified ' + selfName + '\n' +
                '                          checks the current directory for all files with the\n' +
                '                          file extension ".nbuild". For every matched\n' +
                '                          configuration file ' + selfName + ' performs a run.\n' +
                ' --config-help            Display a help message for the configuration file\n' +
                '                          format and exit.\n' +
                ' --ignore-warnings        Compilation warnings are not shown on stderr.\n' +
                ' --ignore-errrors         Compilation errors are not shown on stderr.\n' +
                ' --ignore-compiled-code   The compiled code is not shown on stdout.\n' +
                ' --stop-on-error          All compilation processes are stopped in case a\n' +
                '                          compilation error occurs. ' + selfName + ' will\n' +
                '                          exit with the exit code 1.\n' +
                ' --stop-on-warning        All compilation processes are stopped in case a\n' +
                '                          compilation warning occurs. ' + selfName + ' will\n' +
                '                          exit with the exit code 1.\n');
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
                '  },\n' +
                '  "next": {\n' +
                '    "<file path to the next config relative to this config>": {\n' +
                '      "inheritSources": <boolean>,\n' +
                '      "inheritExterns": <boolean>,\n' +
                '      "inheritBuildOptions": <boolean>\n' +
                '    },\n' +
                '    "<file path to another config relative to this config>": {\n' +
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
 * Instantiates a CCBuild object.
 *
 * @classdesc This class parses the passed arguments array and starts processing the configuration files and the
 *            corresponding compilation units.
 *
 * @constructor
 *
 * @extends events.EventEmitter
 * @emits CCBuild#argsError
 * @emits CCBuild#help
 * @emits CCBuild#version
 * @emits CCBuild#configHelp
 * @emits CCBuild#closureHelp
 * @emits CCBuild#closureVersion
 * @emits CCBuild#compilerPath
 * @emits CCBuild#contribPath
 * @emits CCBuild#configError
 * @emits CCBuild#circularDependencyError
 * @emits CCBuild#compilationError
 * @emits CCBuild#compiled
 *
 * @param {Array<string>} argv An array representing the CLI arguments that will be parsed by this class.
 */
function CCBuild (argv) {
    /**
     * States that the parsing process of the CLI arguments failed.
     *
     * @event CCBuild#argsError
     * @param {Error} err The error that occurred during argumentation parsing.
     */

    /**
     * States that ccbuild was called with --help or -h and that the help message of ccbuild is ready.
     *
     * @event CCBuild#help
     * @param {string} helpMessage The help message that can be displayed.
     */

    /**
     * States that ccbuild was called with --version or -v and that the version information of ccbuild is ready.
     *
     * @event CCBuild#version
     * @param {string} version The requested version information.
     */

    /**
     * States that ccbuild was called with --config-help and that the help message for configuration files is ready.
     *
     * @event CCBuild#configHelp
     * @param {string} helpMessage The help message that can be printed.
     */

    /**
     * States that ccbuild was called with --closure-help and that the help message is ready.
     *
     * @event CCBuild#closureHelp
     * @param {string} helpMessage The help message that can be printed.
     */

    /**
     * States that ccbuild was called with --closure-version and that the version information is ready.
     *
     * @event CCBuild#closureVersion
     * @param {string} compilerVersion The requested version information.
     */

    /**
     * States the ccbuild was called with --compiler-path and that the compiler path information is ready.
     *
     * @event CCBuild#compilerPath
     * @param {string} compilerPath The requested compiler path information.
     */

    /**
     * States the ccbuild was called with --contrib-path and that the contrib path information is ready.
     *
     * @event CCBuild#contribPath
     * @param {string} contribPath The requested contrib path information.
     */

    /**
     * States that an error occurred during processing a configuration file.
     *
     * @event CCBuild#configError
     * @param {Error} err The occurred error during config processing.
     */

    /**
     * States an error that two or more cofniguration files have circular dependencies.
     *
     * @event CCBuild#circularDependencyError
     * @param {Error} err The circular dependency error that occurred during config processing.
     */

    /**
     * States an error occurred during the compilation process..
     *
     * @event CCBuild#compilationError
     * @param {string} unitName The name of the compilation unit that failed.
     * @param {Error} err The compilation error.
     */

    /**
     * States that the compilation was successful.
     *
     * @event CCBuild#compiled
     * @param {string} unitName The name of the compilation unit that was compiled.
     * @param {string} stdout The content that was generated by the Closure Compiler on stdout.
     * @param {string} stderr The content that was generated by the Closure Compiler on stderr.
     */

    if (!util.isArray(argv)) throw Error('"argv" must be a string array!');
    events.EventEmitter.call(this);
    var self = this;
    self.on('argsParsed', function (cliArgs) {
        if (cliArgs.configs) {
            self._processConfigs(/** @type {{configs: Array<string>}} */ (cliArgs));
        } else {
            configReader.getLocalConfigFiles().then(function (configFiles) {
                cliArgs.configs = configFiles;
                self._processConfigs(/** @type {{configs: Array<string>}} */ (cliArgs));
            });
        }
    });
    process.nextTick(function () {
        self._parseCliArgs(argv);
    });
}

util.inherits(CCBuild, events.EventEmitter);

/**
 * Parse all CLI arguments and emit an 'argsParsed' event with the parsed arguments object as parameter.
 * In case of error, the event 'argsError' is emitted.
 *
 * @private
 *
 * @param {Array<string>} args An array with all CLI arguments.
 */
CCBuild.prototype._parseCliArgs = function (args) {
    var self = this;
    var emitFromPromise = function (eventName, promise) {
        promise.then(function (promiseResult) {
            self.emit(eventName, promiseResult);
        }).catch(function (err) {
            self.emit('argsError', err);
        });
    };
    var result = {};
    var i = 2;
    for (; i < args.length; ++i) {
        switch (args[i]) {
        case '--help':
        case '-h':
            emitFromPromise('help', utils.getSelfVersion());
            break;
        case '--version':
        case '-v':
            emitFromPromise('version', utils.getSelfVersion());
            break;
        case '--config':
        case '-c':
            if (i + 1 === args.length) {
                this.emit('argsError', new Error('-c|--config requires a PATH parameter'));
            } else {
                if (!result.hasOwnProperty('configs')) result.configs = [];
                result.configs.push(path.resolve(args[++i]));
            }
            break;
        case '--config-help':
            emitFromPromise('configHelp', getConfigFileHelp());
            break;
        case '--closure-help':
            emitFromPromise('closureHelp', utils.getCCHelp());
            break;
        case '--closure-version':
            emitFromPromise('closureVersion', utils.getCCVersion());
            break;
        case '--compiler-path':
            this.emit('compilerPath', CC.compiler.COMPILER_PATH);
            break;
        case '--contrib-path':
            this.emit('contribPath', CC.compiler.CONTRIB_PATH);
            break;
        case '--ignore-warnings':
            result.ignoreWarnings = true;
            break;
        case '--ignore-errors':
            result.ignoreErrors = true;
            break;
        case '--ignore-compiled-code':
            result.ignoreCompiledCode = true;
            break;
        case '--stop-on-error':
            result.stopOnError = true;
            break;
        case '--stop-on-warning':
            result.stopOnWarning = true;
            break;
        default:
            this.emit('argsError', new Error('The option "' + args[i] + '" is not supported'));
            i = args.length;
            break;
        }
    }
    if (result.configs !== undefined) result.configs = utils.arrayToSet(result.configs);
    this.emit('argsParsed', result);
};

/**
 * Invokes the compilation process for each configuration file specified via the CLI and via the next property in the
 * configuration files themselves.
 *
 * @private
 *
 * @param {{configs: Array<string>}} cliArgs An object containing all CLI arguments.
 */
CCBuild.prototype._processConfigs = function (cliArgs) {
    var self = this;

    /**
     * @private
     *
     * @returns {function(function(...*))} A function that expects a done callback that can be called by async
     *          functions.
     * @param {CompilerConfiguration} compilationUnit The compiler configuration for a compilation unit.
     */
    var compileUnit = function (compilationUnit) {
        return function (done) {
            compile(compilationUnit).then(function (args) {
                self.emit('compiled', args.compilationUnit, args.stdout, args.stderr);
                done();
            }).catch(function (args) {
                self.emit('compilationError', args.compilationUnit, args.error);
                done();
            });
        };
    };

    var processedConfigFiles = [];

    /**
     * @private
     *
     * @param {string} configFilePath The file path of the configuration file to be processed.
     * @param {Object=} parentConfig The parsed parent configuration - if present.
     */
    var processConfig = function (configFilePath, parentConfig) {
        var deferred = Q.defer();

        // We ignore duplicate configuration files. This can be for example the case if the same configuration file is
        // specified viw the CLI argument --config|-c and vie the next property in a parent configuration file.
        if (processedConfigFiles.indexOf(configFilePath) === -1) {
            configReader.readAndParseConfiguration(configFilePath, parentConfig).then(function (configObject) {
                var compilationUnits = Object.keys(configObject.compilationUnits).map(function (compilationUnit) {
                    return {
                        workingDirectory: path.dirname(configFilePath),
                        unitName: compilationUnit,
                        globalSources: configObject.sources,
                        unitSources: configObject.compilationUnits[compilationUnit].sources,
                        globalExterns: configObject.externs,
                        unitExterns: configObject.compilationUnits[compilationUnit].externs,
                        globalBuildOptions: configObject.buildOptions,
                        unitBuildOptions: configObject.compilationUnits[compilationUnit].buildOptions
                    };
                });
                processedConfigFiles.push(configFilePath);

                Q.allSettled(Object.keys(configObject.next).map(function (nextConfigFilePath) {
                    return processConfig(nextConfigFilePath, configObject);
                })).then(function (queuedCompilationUnitsPromises) {
                    var queuedCompilationsUnits = queuedCompilationUnitsPromises.map(function (promise) {
                        if (promise.state === 'fulfilled') return promise.value;
                        else return undefined;
                    }).filter(function (compilationUnits) {
                        return compilationUnits !== undefined;
                    }).reduce(function (accumulator, currentValue) {
                        return accumulator.concat(currentValue);
                    }, []);
                    deferred.resolve(queuedCompilationsUnits.concat(compilationUnits));
                });
            }).catch(function (err) {
                self.emit('configError', err);
                deferred.reject(err);
            });
        } else {
            var error = new Error('Discovered circular dependency to "' + configFilePath + '"!');
            self.emit('circularDependencyError', error);
            deferred.reject(error);
        }
        return deferred.promise;
    };

    Q.allSettled(cliArgs.configs.map(function (configFilePath) {
        return processConfig(configFilePath);
    })).then(function (queuedCompilationUnitsPromises) {
        var queuedCompilationUnits = queuedCompilationUnitsPromises.map(function (promise) {
            if (promise.state === 'fulfilled') return promise.value;
            else return undefined;
        }).filter(function (compilationUnit) {
            return compilationUnit !== undefined;
        }).reduce(function (accumulator, currentValue) {
            return accumulator.concat(currentValue);
        }, []).map(compileUnit);
        async.series(queuedCompilationUnits);
    });
};

/**
 * Invokes the Closure Compiler with the passed arguments. All global and local settings are merged and passed as merged
 * arguments to the Closure Compiler.
 *
 * @private
 *
 * @returns {QPromise<Object>} A promise holding the compilation result.
 * @param {CompilerConfiguration} compilerConfiguration An objet that contains the compiler configuration for a
 *        particular compilation unit.
 */
function compile (compilerConfiguration) {
    var deferred = Q.defer();
    var compilerArguments = configReader.getCompilerArguments(compilerConfiguration);
    var compiler = new CC.compiler(compilerArguments);
    process.chdir(compilerConfiguration.workingDirectory);
    compiler.run(function (code, stdout, stderr) {
        if (code !== 0) {
            deferred.reject({compilationUnit: compilerConfiguration.unitName,
                             error: new Error(code + (stderr ? ': ' + stderr : ''))});
        } else {
            deferred.resolve({compilationUnit: compilerConfiguration.unitName, stdout: stdout, stderr: stderr});
        }
    });
    return deferred.promise;
};

module.exports = CCBuild;
