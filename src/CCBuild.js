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
var configurationReader = require('./configurationReader.js');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Compiler = /** @type {function(new:Compiler): undefined} */ (require('./compiler/Compiler.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var CachingCompiler = /** @type {function(new:CachingCompiler): undefined} */
    (require('./compiler/CachingCompiler.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var ClosureCompiler = /** @type {function(new:ClosureCompiler): undefined} */
    (require('./compiler/ClosureCompiler.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var CLI = /** @type {function(new:CLI, Array<string>)}*/ (require('./CLI.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var VariableManager = /** @type {function(new:VariableManager, VariableManager=)}*/ (require('./VariableManager.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var GCCResultProcessor =
        /** @type {function (new:GCCResultProcessor, number, (null|string)=, (null|string)=): undefined}*/
    (require('./GCCResultProcessor.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var GCCMessage = /** @type {function(new:GCCMessage, string)}*/ (require('./GCCMessage.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var WarningsFilterProcessor =
        /** @type {function(number): WarningsFilterProcessor} */ (require('./WarningsFilterProcessor.js'));

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
 * @emits CCBuild#argsParsed
 * @emits CCBuild#compilerPath
 * @emits CCBuild#contribPath
 * @emits CCBuild#configError
 * @emits CCBuild#circularDependencyError
 * @emits CCBuild#compilationError
 * @emits CCBuild#compiled
 * @emits CCBuild#done
 *
 * @param {Array<string>} argv An array representing the CLI arguments that will be parsed by this class.
 * @throws {Error} Thrown if argv is not null, undefined or an Array.
 *
 * @suppress {misplacedTypeAnnotation}
 */
function CCBuild (argv) {
    if (!argv) argv = [];
    if (!util.isArray(argv)) throw Error('"argv" must be a string array!');
    events.EventEmitter.call(this);
    this._cli = new CLI(argv);
    var self = this;
    this._cli.on('argsError', function (err) {
        /**
         * States that the parsing process of the CLI arguments failed.
         *
         * @event CCBuild#argsError
         * @param {Error} err The error that occurred during argumentation parsing.
         */
        self.emit('argsError', err);
    });
    this._cli.on('help', function (helpInfo) {
        /**
         * States that the option --help or -h was set and that the help message of ccbuild is ready.
         *
         * @event CCBuild#help
         * @param {string} helpInfo The help message that can be displayed.
         */
        self.emit('help', helpInfo);
    });
    this._cli.on('version', function (versionInfo) {
        /**
         * States that the option --version or -v was set and that the version information of ccbuild is ready.
         *
         * @event CCBuild#version
         * @param {string} versionInfo The requested version information.
         */
        self.emit('version', versionInfo);
    });
    this._cli.on('configHelp', function (configHelpInfo) {
        /**
         * States that the option --config-help was set and that the help message for configuration files is ready.
         *
         * @event CCBuild#configHelp
         * @param {string} configHelpInfo The help message that can be printed.
         */
        self.emit('configHelp', configHelpInfo);
    });
    this._cli.on('closureHelp', function (closureHelpInfo) {
        /**
         * States that the option --closure-help was set and that the help message is ready.
         *
         * @event CCBuild#closureHelp
         * @param {string} closureHelpInfo The help message that can be printed.
         */
        self.emit('closureHelp', closureHelpInfo);
    });
    this._cli.on('closureVersion', function (closureVersionInfo) {
        /**
         * States that the option --closure-version was set and that the version information is ready.
         *
         * @event CCBuild#closureVersion
         * @param {string} compilerVersionInfo The requested version information.
         */
        self.emit('closureVersion', closureVersionInfo);
    });
    this._cli.on('compilerPath', function (compilerPath) {
        /**
         * States that the option --compiler-path was set and that the compiler path information is ready.
         *
         * @event CCBuild#compilerPath
         * @param {string} compilerPath The requested compiler path information.
         */
        self.emit('compilerPath', compilerPath);
    });
    this._cli.on('contribPath', function (contribPath) {
        /**
         * States that the option --contrib-path was set and that the contrib path information is ready.
         *
         * @event CCBuild#contribPath
         * @param {string} contribPath The requested contrib path information.
         */
        self.emit('contribPath', contribPath);
    });
    this._cli.on('argsParsed', function (args) {
        /**
         * States that the parsing of CLI arguments was finished was set and that the contrib path information is ready.
         *
         * @event CCBuild#argsParsed
         * @param {Object} args The parsed argument object.
         */
        self.emit('argsParsed', args);
    });

    this._variableManager = VariableManager.create();

    self.once('argsParsed', function (cliArgs) {
        if (cliArgs.configs) {
            self._processConfigs(/** @type {{configs: Array<string>}} */ (cliArgs), self._variableManager);
        } else {
            configurationReader.getLocalConfigFiles().then(function (configFiles) {
                cliArgs.configs = configFiles;
                self._processConfigs(/** @type {{configs: Array<string>}} */ (cliArgs), self._variableManager);
            });
        }
    });
}

util.inherits(CCBuild, events.EventEmitter);

/**
 * Invokes the compilation process for each configuration file specified via the CLI and via the next property in the
 * configuration files themselves.
 *
 * @private
 *
 * @param {{configs: Array<string>}} cliArgs An object containing all CLI arguments.
 * @param {VariableManager} rootVariableManager The root variable manager that is used for variable resolution.
 *
 * @suppress {misplacedTypeAnnotation}
 */
CCBuild.prototype._processConfigs = function (cliArgs, rootVariableManager) {
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
            self._compile(cliArgs, compilationUnit).then(function (args) {
                done();
            }).catch(function (args) {
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

        var globalContainsJsOutputFile;
        var globalContainsJs;
        var globalContainsExterns;
        var localContainsJsOutputFile;
        var localContainsJs;
        var localContainsExterns;

        // We ignore duplicate configuration files. This can be for example the case if the same configuration file is
        // specified viw the CLI argument --config|-c and via the next property in a parent configuration file.
        if (processedConfigFiles.indexOf(configFilePath) === -1) {
            configurationReader.readAndParseConfiguration(
                path.relative(process.cwd(), configFilePath), parentConfig, rootVariableManager)
                .then(function (configObject) {
                    globalContainsJsOutputFile = configObject.buildOptions.indexOf('--js_output_file') !== -1;
                    globalContainsJs = configObject.buildOptions.indexOf('--js') !== -1;
                    globalContainsExterns = configObject.buildOptions.indexOf('--externs') !== -1;
                    var compilationUnits = [];
                    var objectKeys = Object.keys(configObject.compilationUnits);
                    var i = 0;
                    var outputFile;
                    var err;
                    for (; i !== objectKeys.length; ++i) {
                        localContainsJsOutputFile = configObject.compilationUnits[objectKeys[i]].buildOptions
                            .indexOf('--js_output_file') !== -1;
                        localContainsJs = configObject.compilationUnits[objectKeys[i]]
                            .buildOptions.indexOf('--js') !== -1;
                        localContainsExterns = configObject.compilationUnits[objectKeys[i]].buildOptions
                            .indexOf('--externs') !== -1;
                        outputFile = configObject.compilationUnits[objectKeys[i]].outputFile;
                        if (localContainsJsOutputFile || globalContainsJsOutputFile || localContainsJs ||
                            globalContainsJs || localContainsExterns || globalContainsExterns) {
                            break;
                        }
                        if (!cliArgs.filteredUnits || cliArgs.filteredUnits.length === 0 ||
                            cliArgs.filteredUnits.indexOf(objectKeys[i]) !== -1) {
                            var compilationUnit = {
                                unitName: objectKeys[i],
                                globalSources: configObject.sources,
                                unitSources: configObject.compilationUnits[objectKeys[i]].sources,
                                globalExterns: configObject.externs,
                                unitExterns: configObject.compilationUnits[objectKeys[i]].externs,
                                globalBuildOptions: configObject.buildOptions,
                                unitBuildOptions: configObject.compilationUnits[objectKeys[i]].buildOptions,
                                outputFile: outputFile,
                                unitWarningsFilterFile: configObject.compilationUnits[objectKeys[i]].warningsFilterFile,
                                globalWarningsFilterFile: configObject.warningsFilterFile
                            };

                            if (compilationUnit.globalSources.length === 0 &&
                                compilationUnit.unitSources.length === 0 &&
                                compilationUnit.globalBuildOptions.indexOf('--js') === -1 &&
                                compilationUnit.unitBuildOptions.indexOf('--js') === -1) {
                                err = new Error('No source files defined for the compilation unit "' +
                                                compilationUnit.unitName + '"!\n' +
                                                'Consider to set the "sources" or "buildOptions" property in either ' +
                                                'the global or a unit section.');
                                self.emit('configError', err);
                            } else {
                                compilationUnits.push(compilationUnit);
                            }
                        }
                    }
                    if (localContainsJsOutputFile || globalContainsJsOutputFile) {
                        err = new Error('Encountered the option "--js_output_file" in buildOptions in the ' +
                                        'compilation unit "' + objectKeys[i] + '". Use the property "outputFile" ' +
                                        'instead!');
                        self.emit('configError', err);
                        deferred.reject(err);
                    } else if (localContainsJs || globalContainsJs) {
                        err = new Error('Encountered the option "--js" in buildOptions in the compilation unit ' +
                                        '"' + objectKeys[i] + '". Use the property "sources" instead!');
                        self.emit('configError', err);
                        deferred.reject(err);
                    } else if (localContainsExterns || globalContainsExterns) {
                        err = new Error('Encountered the option "--externs" in buildOptions in the compilation unit ' +
                                        '"' + objectKeys[i] + '". Use the property "externs" instead!');
                        self.emit('configError', err);
                        deferred.reject(err);
                    } else {
                        processedConfigFiles.push(configFilePath);
                        Q.allSettled(Object.keys(configObject.next)
                                     .filter(function (nextConfigFilePath) {
                                         return !cliArgs.filteredNextEntries ||
                                             utils.arrayContains(cliArgs.filteredNextEntries, nextConfigFilePath);
                                     })
                                     .map(function (nextConfigFilePath) {
                                         var p = nextConfigFilePath;
                                         if (!path.isAbsolute(p)) path.join(configFilePath, nextConfigFilePath);
                                         return processConfig(p, configObject);
                                     }))
                            .then(function (queuedCompilationUnitsPromises) {
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
                    }
                }).catch(function (err) {
                    /**
                     * States that an error occurred during processing a configuration file.
                     *
                     * @event CCBuild#configError
                     * @param {Error} err The occurred error during config processing.
                     */
                    self.emit('configError', err);
                    deferred.reject(err);
                });
        } else {
            var error = new Error('Discovered circular dependency to "' + configFilePath + '"!');
            /**
             * States an error that two or more cofniguration files have circular dependencies.
             *
             * @event CCBuild#circularDependencyError
             * @param {Error} err The circular dependency error that occurred during config processing.
             */
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
        async.series(queuedCompilationUnits, function () {
            /**
             * States that the processing of all config files and the compilation of all defined compilation units is
             * done. This event is emitted after all {@link CCBuild#compiled} and {@link CCBuild#compilationError}
             * events are emitted.
             *
             * @event CCBuild#done
             */
            self.emit('done');
        });
    });
};

/**
 * Invokes the Closure Compiler with the passed arguments. All global and local settings are merged and passed as merged
 * arguments to the Closure Compiler.
 *
 * @private
 *
 * @returns {QPromise<Object>} A promise holding the compilation result.
 * @param {{configs: Array<string>}} cliArgs An object containing all CLI arguments.
 * @param {CompilerConfiguration} compilerConfiguration An objet that contains the compiler configuration for a
 *        particular compilation unit.
 *
 * @suppress {misplacedTypeAnnotation}
 */
CCBuild.prototype._compile = function (cliArgs, compilerConfiguration) {
    var self = this;
    var deferred = Q.defer();

    var compiler;
    if (cliArgs.disableCaching) {
        compiler = new ClosureCompiler();
    } else {
        compiler = new CachingCompiler(cliArgs.cacheLocation);
    }
    var compilerPromise;
    try {
        compilerPromise = compiler.compile(compilerConfiguration);
    } catch (err) {
        self.emit('configError', compilerConfiguration.unitName, err);
        deferred.reject({compilationUnit: compilerConfiguration.unitName, error: err});
        return deferred.promise;
    }

    compilerPromise
        .then(function (compilationResult) {
            var warningsFilterProcessor = WarningsFilterProcessor(compilationResult.code);
            var currentWarningsFilterFiles = compilerConfiguration.globalWarningsFilterFile
                .concat(compilerConfiguration.unitWarningsFilterFile);
            return Q
                .all(currentWarningsFilterFiles.map(function (filePath) {
                    return warningsFilterProcessor.registerWarningsFilterFile(filePath);
                }))
                .then(function () {
                    var gccResultProcessor = new GCCResultProcessor(compilationResult.code, compilationResult.stdout,
                                                                    compilationResult.stderr);
                    var messageResults = warningsFilterProcessor
                        .processMessages(gccResultProcessor.getResults(), currentWarningsFilterFiles);
                    var filteredStderr = GCCMessage.messagesToString(messageResults);
                    if (compilationResult.code !== 0) {
                        var err = new Error(compilationResult.code + (filteredStderr ? ': ' + filteredStderr : ''));
                        /**
                         * States an error occurred during the compilation process..
                         *
                         * @event CCBuild#compilationError
                         * @param {string} unitName The name of the compilation unit that failed.
                         * @param {Error} err The compilation error.
                         */
                        self.emit('compilationError', compilerConfiguration.unitName, err);
                        deferred.reject({compilationUnit: compilerConfiguration.unitName, error: err});
                    } else {
                        /**
                         * States that the compilation was successful.
                         *
                         * @event CCBuild#compiled
                         * @param {string} unitName The name of the compilation unit that was compiled.
                         * @param {string} stdout The content that was generated by the Closure Compiler on stdout.
                         * @param {string} stderr The content that was generated by the Closure Compiler on stderr.
                         */
                        self.emit('compiled', compilerConfiguration.unitName, compilationResult.stdout, filteredStderr);
                        deferred.resolve({compilationUnit: compilerConfiguration.unitName,
                                          stdout: compilationResult.stdout,
                                          stderr: filteredStderr});
                    }
                })
                .catch(function (err) {
                    self.emit('configError', err);
                    deferred.reject(err);
                });
        });
    return deferred.promise;
};

module.exports = CCBuild;
