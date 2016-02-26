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
 */
function CLI (argv) {
    /**
     * States that the parsing process of the CLI arguments failed.
     *
     * @event CCBuild#argsError
     * @param {Error} err The error that occurred during argumentation parsing.
     */

    /**
     * States that the option --help or -h was set and that the help message of ccbuild is ready.
     *
     * @event CCBuild#help
     * @param {string} helpInfo The help message that can be displayed.
     */

    /**
     * States that the option --version or -v was set and that the version information of ccbuild is ready.
     *
     * @event CCBuild#version
     * @param {string} versionInfo The requested version information.
     */

    /**
     * States that the option --config-help was set and that the help message for configuration files is ready.
     *
     * @event CCBuild#configHelp
     * @param {string} configHelpInfo The help message that can be printed.
     */

    /**
     * States that the option --closure-help was set and that the help message is ready.
     *
     * @event CCBuild#closureHelp
     * @param {string} closureHelpInfo The help message that can be printed.
     */

    /**
     * States that the option --closure-version was set and that the version information is ready.
     *
     * @event CCBuild#closureVersion
     * @param {string} compilerVersionInfo The requested version information.
     */

    /**
     * States that the option --compiler-path was set and that the compiler path information is ready.
     *
     * @event CCBuild#compilerPath
     * @param {string} compilerPath The requested compiler path information.
     */

    /**
     * States that the option --contrib-path was set and that the contrib path information is ready.
     *
     * @event CCBuild#contribPath
     * @param {string} contribPath The requested contrib path information.
     */

    /**
     * States that the option --contrib-path was set and that the contrib path information is ready.
     *
     * @event CCBuild#argsParsed
     * @param {Object} args The parsed argument object.
     */

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
    var deferred = Q.defer();
    CLI.getSelfName().then(function (selfName) {
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
    rpj('./package.json', function (err, data) {
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
 * @param {Array<string>} args An array with all CLI arguments.
 */
CLI.prototype._parseCliArgs = function (args) {
    if (!util.isArray(args)) args = [];

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
            emitFromPromise('help', CLI.getUsage());
            break;
        case '--version':
        case '-v':
            emitFromPromise('version', CLI.getSelfVersion());
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
            emitFromPromise('configHelp', CLI.getConfigFileHelp());
            break;
        case '--closure-help':
            emitFromPromise('closureHelp', CLI.getCCHelp());
            break;
        case '--closure-version':
            emitFromPromise('closureVersion', CLI.getCCVersion());
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
