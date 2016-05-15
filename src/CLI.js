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
var rpj = /** @type {function(...*): Promise} */ (require('read-package-json'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var CC = require('google-closure-compiler');

/**
 * @ignore
 * @suppress {duplicate}
 */
var utils = require('./utils');

/**
 * Instantiates a CLI object.
 *
 * @classdesc This class reads and parses the CLI arguments passed to it as an array of strings. In addition it
 *            implements the events.EventEmitter API to signal certain states.
 *
 * @constructor
 *
 * @extends events.EventEmitter
 * @emits CLI#argsError
 * @emits CLI#help
 * @emits CLI#version
 * @emits CLI#configHelp
 * @emits CLI#closureHelp
 * @emits CLI#closureVersion
 * @emits CLI#compilerPath
 * @emits CLI#contribPath
 * @emits CLI#argsParsed
 *
 * @param {Array<string>} argv An array representing the CLI arguments that will be parsed by this class.
 * @throws {Error} Thrown if argv is not null, undefined or an Array.
 */
function CLI (argv) {
    if (!argv) argv = [];
    if (!util.isArray(argv)) throw Error('"argv" must be a string array!');

    events.EventEmitter.call(this);
    process.nextTick(this._parseCliArgs.bind(this, argv));
}

util.inherits(CLI, events.EventEmitter);

/**
 * Get the usage text.
 *
 * @private
 * @static
 *
 * @returns {Promise<string>} A promise that holds the usage text as a string value.
 */
CLI.getUsage = function () {
    var deferred = Q.defer();
    CLI.getSelfName().then(function (selfName) {
        deferred.resolve(
            'Usage: ' + selfName + ' [-h|--help] [-v|--version] [--closure-help]\n' +
                '           [--config-help] [--closure-version] [--compiler-path]\n' +
                '           [--contrib-path] [--ignore-warnings] [-ignore-errors]\n' +
                '           [-c|--config PATH]... [--ignore-compiled-code] [--stop-on-error]\n' +
                '           [--stop-on-warning] [-u|--unit UNIT_NAME]... [--ignore-check-fs]\n\n' +
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
                '                          You may specify multiple configurations.\n' +
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
                '                          exit with the exit code 1.\n' +
                ' -u|--unit UNIT_NAME      Filter the compilation units that are taken into\n' +
                '                          account for the compilation process. All other units\n' +
                '                          are ignored.\n' +
                '                          You may specify multiple compilation units.\n' +
                '                          If no compilation unit is specified, all units\n' +
                '                          defined in the configuration files will be processed.\n' +
                ' --ignore-check-fs        Ignore the processing of the configuration property\n' +
                '                          "checkFs" which is responsible for checking whether\n' +
                '                          specified files are included in the defined\n' +
                '                          compilation units.\n\n' +
                selfName + ' exits with the return code 0 in case of successful compilation(s) this\n' +
                'includes warnings as well. In case of compilation errors and file verification\n' +
                'errors the return code is 1.\n');
    }).catch(deferred.reject);
    return deferred.promise;
};

/**
 * Get a help text for the configuration file.
 *
 * @private
 * @static
 *
 * @returns {Promise<string>} A promise that holds the help text for the config file format as a string value.
 */
CLI.getConfigFileHelp = function () {
    var configSample = {
        checkFs: {
            check: ['<GLOB paths to files to be checked whether they are included in any compilation unit>'],
            fileExtensions: ['<file extensions of files to be checked. This filter is applied on files ' +
                             'resulting from "check". If nothing is specified, the default is set to ".js" and ' +
                             '".json">'],
            ignore: ['<GLOB paths to files that are ignored from checking>']
        },
        sources: ['<source file paths to be included in all compilation units defined in this config>',
                  '${CWD}/file.js'],
        externs: ['<extern file paths to be included in all compilation units defined in this config>',
                  '${CONTRIB_PATH}/nodejs/os.js'],
        buildOptions: ['<options to be used for all compilation units defined in this config>'],
        compilationUnits: {
            'unit 1': {
                externs: ['<source file paths to be used only for this compilation unit>'],
                sources: ['<extern file paths to be used only for this compilation unit>'],
                buildOptions: ['<options to be used only for this compilation unit>']
            },
            'unit 2': {
                externs: ['<source file paths to be used only for this compilation unit>'],
                sources: ['<extern file paths to be used only for this compilation unit>'],
                outputFile: 'file path to resulting code',
                buildOptions: ['<options to be used only for this compilation unit>']
            }
        },
        next: {
            '<file path to the next config relative to this config>': {
                inheritSources: '<boolean>',
                inheritExterns: '<boolean>',
                inheritBuildOptions: '<boolean>'
            },
            '<file path to another config relative to this config>': {
                inheritSources: '<boolean>',
                inheritExterns: '<boolean>',
                inheritBuildOptions: '<boolean>'
            }
        }
    };

    var deferred = Q.defer();
    CLI.getSelfName().then(function (selfName) {
        deferred.resolve(
            'The configuration files for ' + selfName + ' use the JSON format and are of the\n' +
                'following form:\n\n' +
                JSON.stringify(configSample, null, 2) +
                '\n\n' +
                'Note: buildOptions can be either an array of strings or an object as specified\n' +
                'at https://www.npmjs.com/package/google-closure-compiler#specifying-options.');
    }).catch(deferred.reject);
    return deferred.promise;
};

/**
 * Get the version defined in package.json.
 *
 * @static
 *
 * @returns {Promise<string>} A promise holding the version of this app's package.json file.
 */
CLI.getSelfVersion = function () {
    return /** @type {Promise<string>} */ (getPropertyValueFromPackageJson ('version'));
};

/**
 * Get the name defined in package.json.
 *
 * @static
 *
 * @returns {Promise<string>} A promise holding the version of this app's package.json file.
 */
CLI.getSelfName = function () {
    return /** @type {Promise<string>} */ (getPropertyValueFromPackageJson ('name'));
};

/**
 * Get the version of the closure compiler.
 *
 * @static
 *
 * @returns {Promise<string>} A promise holding the version of the used Closure Compiler.
 */
CLI.getCCVersion = function () {
    var deferred = Q.defer();
    var compiler = new CC.compiler(['--version']);
    compiler.run(function (code, stdout, stderr) {
        if (code !== 0 || stderr) {
            var err = new Error(code + (stderr ? ': ' + stderr : ''));
            deferred.reject(err);
        } else {
            deferred.resolve(stdout);
        }
    });

    return deferred.promise;
};

/**
 * Read a property of this package's package.json file.
 *
 * @private
 *
 * @returns {Promise<*>} A promise that holds the read value.
 * @param {string} propertyName The property name that is read in package.json.
 */
function getPropertyValueFromPackageJson (propertyName) {
    var deferred = Q.defer();
    rpj(path.join(__dirname, '..', 'package.json'), function (err, data) {
        if (err) deferred.reject(err);
        else deferred.resolve(data[propertyName]);
    });
    return deferred.promise;
};

/**
 * Parse all CLI arguments and emit an 'argsParsed' event with the parsed arguments object as parameter.
 * In case of error, the event 'argsError' is emitted.
 *
 * @private
 *
 * @param {Array<string>} argv An array with all CLI arguments.
 *
 * @suppress {misplacedTypeAnnotation}
 */
CLI.prototype._parseCliArgs = function (argv) {
    var self = this;
    var emitFromPromise = function (eventName, promise) {
        promise.then(function (promiseResult) {
            self.emit(eventName, promiseResult);
        }).catch(function (err) {
            /**
             * States that the parsing process of the CLI arguments failed.
             *
             * @event CLI#argsError
             * @param {Error} err The error that occurred during argumentation parsing.
             */
            self.emit('argsError', err);
            return;
        });
    };
    var result = {};
    var i = 2;
    for (; i < argv.length; ++i) {
        switch (argv[i]) {
        case '--help':
        case '-h':
            /**
             * States that the option --help or -h was set and that the help message of ccbuild is ready.
             *
             * @event CLI#help
             * @param {string} helpInfo The help message that can be displayed.
             */
            emitFromPromise('help', CLI.getUsage());
            break;
        case '--version':
        case '-v':
            /**
             * States that the option --version or -v was set and that the version information of ccbuild is ready.
             *
             * @event CLI#version
             * @param {string} versionInfo The requested version information.
             */
            emitFromPromise('version', CLI.getSelfVersion());
            break;
        case '--config':
        case '-c':
            if (i + 1 === argv.length) {
                /**
                 * States that the parsing process of the CLI arguments failed.
                 *
                 * @event CLI#argsError
                 * @param {Error} err The error that occurred during argumentation parsing.
                 */
                this.emit('argsError', new Error('-c|--config requires a PATH parameter'));
                return;
            } else {
                if (!result.configs) result.configs = [];
                result.configs.push(path.resolve(argv[++i]));
            }
            break;
        case '-u':
        case '--unit':
            if (i + 1 === argv.length) {
                /**
                 * States that the parsing process of the CLI arguments failed.
                 *
                 * @event CLI#argsError
                 * @param {Error} err The error that occurred during argumentation parsing.
                 */
                this.emit('argsError', new Error('-u|--unit requires a UNIT_NAME parameter'));
                return;
            } else {
                if (!result.filteredUnits) result.filteredUnits = [];
                result.filteredUnits.push(argv[++i]);
            }
            break;
        case '--config-help':
            /**
             * States that the option --config-help was set and that the help message for configuration files is ready.
             *
             * @event CLI#configHelp
             * @param {string} configHelpInfo The help message that can be printed.
             */
            emitFromPromise('configHelp', CLI.getConfigFileHelp());
            break;
        case '--closure-help':
            /**
             * States that the option --closure-help was set and that the help message is ready.
             *
             * @event CLI#closureHelp
             * @param {string} closureHelpInfo The help message that can be printed.
             */
            emitFromPromise('closureHelp', CLI.getCCHelp());
            break;
        case '--closure-version':
            /**
             * States that the option --closure-version was set and that the version information is ready.
             *
             * @event CLI#closureVersion
             * @param {string} compilerVersionInfo The requested version information.
             */
            emitFromPromise('closureVersion', CLI.getCCVersion());
            break;
        case '--compiler-path':
            /**
             * States that the option --compiler-path was set and that the compiler path information is ready.
             *
             * @event CLI#compilerPath
             * @param {string} compilerPath The requested compiler path information.
             */
            this.emit('compilerPath', CC.compiler.COMPILER_PATH);
            break;
        case '--contrib-path':
            /**
             * States that the option --contrib-path was set and that the contrib path information is ready.
             *
             * @event CLI#contribPath
             * @param {string} contribPath The requested contrib path information.
             */
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
        case '--ignore-check-fs':
            result.ignoreCheckFs = true;
            break;
        default:
            /**
             * States that the parsing process of the CLI arguments failed.
             *
             * @event CLI#argsError
             * @param {Error} err The error that occurred during argumentation parsing.
             */
            this.emit('argsError', new Error('The option "' + argv[i] + '" is not supported'));
            return;
        }
    }
    if (result.configs !== undefined) result.configs = utils.arrayToSet(result.configs);
    if (result.filteredUnits !== undefined) result.filteredUnits = utils.arrayToSet(result.filteredUnits);
    /**
     * States that the parsing of CLI arguments was finished was set and that the contrib path information is ready.
     *
     * @event CLI#argsParsed
     * @param {Object} args The parsed argument object.
     */
    this.emit('argsParsed', result);
};

/**
 * Get the help for the closure compiler.
 *
 * @returns {Promise<string>} A promise holding the help message for the Closure Compiler.
 */
CLI.getCCHelp = function () {
    var deferred = Q.defer();
    var compiler = new CC.compiler(['--help']);
    compiler.run(function (code, stdout, stderr) {
        if (code !== 0 || stderr) {
            var err = new Error(code + (stderr ? ': ' + stderr : ''));
            deferred.reject(err);
        } else {
            deferred.resolve(stdout + '\n');
        }
    });

    return deferred.promise;
};

module.exports = CLI;
