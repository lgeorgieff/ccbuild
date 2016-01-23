#!/usr/bin/env node

/**
 * @private
 *
 * @const
 */
var CC = require('google-closure-compiler');

/**
 * @private
 *
 * @const
 */
var Q = require('q');

/**
 * @private
 *
 * @const
 */
var utils = require('./utils');

/**
 * Get the usage text.
 *
 * @private
 *
 * @returns {Promise} A promise that holds the usage text as a string value.
 */
function getUsage () {
    var deferred =  Q.defer();
    utils.getSelfName().then(function (selfName) {
        deferred.resolve(
            'Usage: ' + selfName + ' [-h|--help] [-v|--version] [--closure-help]\n'+
                '           [--closure-version] [--compiler-path] [--contrib-path]\n' +
                '           [-c|--config PATH] [--config-help]\n\n' +
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
 * Parse all CLI arguments and return an object with the corresponding properties.
 * In case of error, the script exits with exit code 2. Some properties, e.g. --version lead to an exit with exit code 0.
 *
 * @private
 *
 * @returns {Promise} A promise containing an object with all parsed properties.
 * @param {Array<string>} args An array with all CLI arguments.
 */
function parseCliArgs (args) {
    var deferred = Q.defer();
    
    var result = {};
    for (var i = 2; i < args.length; ++i) {
        switch (args[i]) {
        case '--help':
        case '-h':
            getUsage().then(function (usage) {
                console.log(usage);
                process.exit(0);
            }).catch(function (err) {
                deferred.reject(err);
            });
            i = args.length;
            break;
        case '--version':
        case '-v':
            utils.getSelfVersion().then(function (version) {
                console.log(version);
                process.exit(0);
            }).catch(function (err) {
                deferred.reject(err);
            });
            i = args.length;
            break;
        case '--config':
        case '-c':
            break;
        case '--config-help':
            break;
        case '--closure-help':
            break;
        case '--closure-version':
            break;
        case '--compiler-path':
            break;
        case '--contrib-path':
            break;
        default:
            break;
        }
    }
    
    return deferred.promise;
}

/**
 * The entry point of this script.
 *
 * @private
 */
function main() {
    parseCliArgs(process.argv).then(function (cliArgs) {
        console.dir(cliArgs);
    }).catch(function (err) {
        console.error(err);
        process.exit(2);
    });
}

main();