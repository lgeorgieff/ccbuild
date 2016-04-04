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
var events = require('events');

/**
 * @ignore
 * @suppress {duplicate}
 */
var path = require('path');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Q = require('q');

/**
 * @ignore
 * @suppress {duplicate}
 */
var FileChecker = /** @type {function(new:FileChecker, FileCheckerOptions)}*/ (require('./FileChecker.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var CLI = /** @type {function(new:CLI, Array<string>)}*/ (require('./CLI.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var configReader = require('./configReader.js');

/**
 * @ignore
 * @suppress {duplicate}
 */
var utils = require('./utils.js');

/**
 * Instantiates a CCFileCheck object.
 *
 * @classdesc This class parses the passed arguments array and starts processing the configuration files and the
 *            corresponding file checkings whether the specified files are used in any compilation unit.
 *
 * @constructor
 *
 * @extends events.EventEmitter
 * @emits CCFileCheck#argsError
 * @emits CCFileCheck#help
 * @emits CCFileCheck#version
 * @emits CCFileCheck#configHelp
 * @emits CCFileCheck#closureHelp
 * @emits CCFileCheck#closureVersion
 * @emits CCFileCheck#argsParsed
 * @emits CCFileCheck#compilerPath
 * @emits CCFileCheck#contribPath
 * @emits CCFileCheck#configError
 * @emits CCFileCheck#circularDependencyError
 * @emits CCFileCheck#verificationSuccess
 * @emits CCFileCheck#verificationError
 * @emits CCFileCheck#done
 * @emits CCFileCheck#error
 *
 * @param {Array<string>} argv An array representing the CLI arguments that will be parsed by this class.
 * @throws {Error} Thrown if argv is not null, undefined or an Array.
 *
 * @suppress {misplacedTypeAnnotation}
 */
function CCFileCheck (argv) {
    if (!argv) argv = [];
    if (!util.isArray(argv)) throw Error('"argv" must be a string array!');

    events.EventEmitter.call(this);
    this._cli = new CLI(argv);
    var self = this;
    this._cli.on('argsError', function (err) {
        /**
         * States that the parsing process of the CLI arguments failed.
         *
         * @event CCFileCheck#argsError
         * @param {Error} err The error that occurred during argumentation parsing.
         */
        self.emit('argsError', err);
    });
    this._cli.on('help', function (helpInfo) {
        /**
         * States that the option --help or -h was set and that the help message of ccbuild is ready.
         *
         * @event CCFileCheck#help
         * @param {string} helpInfo The help message that can be displayed.
         */
        self.emit('help', helpInfo);
    });
    this._cli.on('version', function (versionInfo) {
        /**
         * States that the option --version or -v was set and that the version information of ccbuild is ready.
         *
         * @event CCFileCheck#version
         * @param {string} versionInfo The requested version information.
         */
        self.emit('version', versionInfo);
    });
    this._cli.on('configHelp', function (configHelpInfo) {
        /**
         * States that the option --config-help was set and that the help message for configuration files is ready.
         *
         * @event CCFileCheck#configHelp
         * @param {string} configHelpInfo The help message that can be printed.
         */
        self.emit('configHelp', configHelpInfo);
    });
    this._cli.on('closureHelp', function (closureHelpInfo) {
        /**
         * States that the option --closure-help was set and that the help message is ready.
         *
         * @event CCFileCheck#closureHelp
         * @param {string} closureHelpInfo The help message that can be printed.
         */
        self.emit('closureHelp', closureHelpInfo);
    });
    this._cli.on('closureVersion', function (closureVersionInfo) {
        /**
         * States that the option --closure-version was set and that the version information is ready.
         *
         * @event CCFileCheck#closureVersion
         * @param {string} compilerVersionInfo The requested version information.
         */
        self.emit('closureVersion', closureVersionInfo);
    });
    this._cli.on('compilerPath', function (compilerPath) {
        /**
         * States that the option --compiler-path was set and that the compiler path information is ready.
         *
         * @event CCFileCheck#compilerPath
         * @param {string} compilerPath The requested compiler path information.
         */
        self.emit('compilerPath', compilerPath);
    });
    this._cli.on('contribPath', function (contribPath) {
        /**
         * States that the option --contrib-path was set and that the contrib path information is ready.
         *
         * @event CCFileCheck#contribPath
         * @param {string} contribPath The requested contrib path information.
         */
        self.emit('contribPath', contribPath);
    });
    this._cli.on('argsParsed', function (contribPath) {
        /**
         * States that the parsing of CLI arguments was finished was set and that the contrib path information is ready.
         *
         * @event CCFileCheck#argsParsed
         * @param {Object} args The parsed argument object.
         */
        self.emit('argsParsed', contribPath);
    });

    self.on('argsParsed', function (cliArgs) {
        var processConfigsOperation;
        if (cliArgs.configs) {
            processConfigsOperation = self._processConfigs(/** @type {{stopOnError: boolean}} */
                (cliArgs));
        } else {
            processConfigsOperation = configReader.getLocalConfigFiles()
                .then(function (configFiles) {
                    cliArgs.configs = configFiles;
                    return self._processConfigs(/** @type {{stopOnError: boolean}} */
                        (cliArgs));
                });
        }

        processConfigsOperation
            .then(function (args) {
                /**
                 * States that the verification process is finished for all defined files.
                 *
                 * @event CCFileCheck#done
                 */
                self.emit('done');
            })
            .catch(function (err) {
                /**
                 * States that an error occurred during the verification process.
                 *
                 * @event CCFileCheck#error
                 * @param {Error} err The occurred error object.
                 */
                self.emit('error', err);
            });
    });
}

util.inherits(CCFileCheck, events.EventEmitter);

/**
 * Process all configs and verifies all files if necessary vie FileChecker.
 *
 * @private
 *
 * @returns {Promise} A Promise holding no further value.
 * @param {{stopOnError: boolean}} cliArgs An object containing all CLI arguments.
 *
 * @emits CCFileCheck#verificationSuccess
 * @emits CCFileCheck#verificationError
 * @emits CCFileCheck#error
 *
 * @suppress {misplacedTypeAnnotation}
 */
CCFileCheck.prototype._processConfigs = function (cliArgs) {
    var self = this;
    var processedConfigFiles = [];

    /**
     * @private
     *
     * @param {string} configFilePath The file path of the configuration file to be processed.
     * @param {Object=} parentConfig The parsed parent configuration - if present.
     */
    var processConfig = function (configFilePath, parentConfig) {
        // We ignore duplicate configuration files. This can be for example the case if the same configuration file is
        // specified viw the CLI argument --config|-c and via the next property in a parent configuration file.
        if (processedConfigFiles.indexOf(configFilePath) === -1) {
            return configReader.readAndParseConfiguration(configFilePath, parentConfig)
                .then(function (configObject) {
                    var sourcesFound = [];
                    Array.prototype.push.apply(sourcesFound, configObject.sources);

                    var objectKeys = Object.keys(configObject.compilationUnits);
                    var i = 0;
                    for (; i !== objectKeys.length; ++i) {
                        Array.prototype.push.apply(sourcesFound, configObject.compilationUnits[objectKeys[i]].sources);
                    }
                    processedConfigFiles.push(configFilePath);
                    return self._checkFiles(cliArgs, configObject.checkIfFilesAreInUnit, sourcesFound, configFilePath)
                        .then(function () {
                            return Q.all(Object.keys(configObject.next).map(function (nextConfigFilePath) {
                                return processConfig(nextConfigFilePath, configObject);
                            }));
                        });
                })
                .catch(function (err) {
                    if (!err.message.startsWith('Discovered circular dependency to "')) self.emit('error', err);
                    throw err;
                });
        } else {
            var error = new Error('Discovered circular dependency to "' + configFilePath + '"!');
            /**
             * States ang error that two or more cofniguration files have circular dependencies.
             *
             * @event CCBuild#circularDependencyError
             * @param {Error} err The circular dependency error that occurred during config processing.
             */
            self.emit('circularDependencyError', error);
            return Q.reject(error);
        }
    };

    var allPromises = cliArgs.configs.map(function (configFilePath) {
        return processConfig(configFilePath);
    });

    var result;
    if (util.isObject(cliArgs) && cliArgs.stopOnError) {
        result = Q.all(allPromises);
    } else {
        result = Q.allSettled(allPromises);
    }

    return result
        .then(function (args) {
            return Q.resolve();
        })
        .catch(function (err) {
            // All promise rejections are handled in this function, i.e. there is no need to handle it outside of this
            // function.
            return Q.resolve();
        });
};

/**
 * Process all configs and verifies all files if necessary via {@link FileChecker}.
 *
 * @private
 *
 * @returns {Promise} A Promise holding no further value.
 * @param {{stopOnError: boolean}} cliArgs An object containing all CLI arguments.
 * @param {{check: !Array<string>, ignore: !Array<string>, fileExtensions: !Array<string>}} settingsFromConfig All
 *        settings defined in `checkIfFilesAreInUnit` of the currently processed configuration file.
 * @param {Array<string>} sourcesFound All sources found in all the compilation units defined in the currently processed
 *        configuraton file.
 * @param {string} configFilePath The file path of the currently processed configuration file.
 *
 * @emits CCFileCheck#verificationSuccess
 * @emits CCFileCheck#verificationError
 * @emits CCFileCheck#error
 *
 * @suppress {misplacedTypeAnnotation}
 */
CCFileCheck.prototype._checkFiles = function (cliArgs, settingsFromConfig, sourcesFound, configFilePath) {
    if (Object.keys(settingsFromConfig).length === 0) return Q.resolve();
    var self = this;

    var options = {
        filesInUnits: utils.arrayToSet(sourcesFound || []),
        fileExtensions: settingsFromConfig.fileExtensions,
        filesToIgnore: settingsFromConfig.ignore,
        filesToCheck: settingsFromConfig.check
    };
    var fileChecker = new FileChecker(options);
    var deferred = Q.defer();
    fileChecker.on('error', function (err) {
        deferred.reject(err);
        fileChecker.removeAllListeners();
    });

    fileChecker.on('verificationSuccess', function (filePath) {
        self.emit('verificationSuccess', filePath, configFilePath);
    });

    fileChecker.on('verificationError', function (filePath) {
        self.emit('verificationError', filePath, configFilePath);

        if (util.isObject(cliArgs) && cliArgs.stopOnError) {
            fileChecker.removeAllListeners();
            deferred.reject(new Error('Caught "verificationError" for the configuration file "' + configFilePath +
                                      '"!'));
        }
    });

    fileChecker.on('verificationDone', deferred.resolve);
    return deferred.promise;
};

module.exports = CCFileCheck;
