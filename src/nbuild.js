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
