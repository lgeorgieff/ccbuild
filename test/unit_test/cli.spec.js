'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var fs = require('fs');

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
var CLI = /** @type {function(new:CLI, Array<string>)} */ (require('../../src/CLI.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var cliUtils = require('./utils/cliUtils.js');

describe('CLI class', function () {
    it('accepts default parameter when instantiating', function () {
        var cli = new CLI();
        expect(cli).not.toBeNull();
        expect(cli).toBeDefined();
        expect(cli).toEqual(jasmine.any(CLI));
    });

    it('throws in case of bad argument', function () {
        expect(function () { new CLI({}); }).toThrow(jasmine.any(Error));
        expect(function () { new CLI(123); }).toThrow(jasmine.any(Error));
        expect(function () { new CLI('--help'); }).toThrow(jasmine.any(Error));
    });

    it('processes --help', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--help']);
        cli.on('help', function (usage) {
            expect(usage).toBe(cliUtils.expectedUsage);
            expect(usage.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes -h', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '-h']);
        cli.on('help', function (usage) {
            expect(usage).toBe(cliUtils.expectedUsage);
            expect(usage.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --version', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--version']);
        cli.on('version', function (version) {
            expect(version).toBe(cliUtils.expectedVersion);
            expect(version.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes -v', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '-v']);
        cli.on('version', function (version) {
            expect(version).toBe(cliUtils.expectedVersion);
            expect(version.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --closure-help', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--closure-help']);
        var eventHandler = jasmine.createSpy('eventHandler');
        cli.on('closureHelp', function (closureHelp) {
            expect(closureHelp.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --closure-version', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--closure-version']);
        cli.on('closureVersion', function (closureVersion) {
            var compiler = new CC.compiler(['--version']);
            compiler.run(function (code, stdout, stderr) {
                if (code !== 0 || stderr) {
                    done.fail(new Error(code + ': ' + stderr));
                } else {
                    expect(closureVersion).toBe(stdout);
                    expect(closureVersion.length).toBeGreaterThan(0);
                    done();
                }
            });
        });
    });

    it('processes --compiler-path', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--compiler-path']);
        cli.on('compilerPath', function (compilerPath) {
            expect(compilerPath).toBe(CC.compiler.COMPILER_PATH);
            expect(compilerPath.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --contrib-path', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--contrib-path']);
        cli.on('contribPath', function (contribPath) {
            expect(contribPath).toBe(CC.compiler.CONTRIB_PATH);
            expect(contribPath.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --config-help', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--config-help']);
        cli.on('configHelp', function (configHelp) {
            expect(configHelp).toBe(cliUtils.expectedConfigHelp);
            expect(configHelp.length).toBeGreaterThan(0);
            done();
        });
    });

    it('emits the event argsError', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--config-hel']);
        cli.on('argsError', function (err) {
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
    });

    it ('emits the event argsParsed', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1]]);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({});
            done();
        });
    });

    it('processes --ignore-warnings', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--ignore-warnings']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreWarnings: true});
            done();
        });
    });

    it('processes --ignore-errors', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--ignore-errors']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreErrors: true});
            done();
        });
    });

    it('processes --ignore-compiled-code', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--ignore-compiled-code']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreCompiledCode: true});
            done();
        });
    });

    it('processes --stop-on-error', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--stop-on-error']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnError: true});
            done();
        });
    });

    it('processes --stop-on-warning', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--stop-on-warning']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnWarning: true});
            done();
        });
    });

    it('processes --config configPath', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--config', 'configPath']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')]});
            done();
        });
    });

    it('processes -c configPath', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '-c', 'configPath']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')]});
            done();
        });
    });

    it('processes multiple --config and -c options', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2', '-c',
                           'configPath3']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2'),
                                            path.resolve('configPath3')]});
            done();
        });
    });

    it('processes duplciate --config and -c options', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2', '-c',
                           'configPath1', '--config', 'configPath2']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2')]});
            done();
        });
    });

    it ('emits the event argsParsed with a proper args object', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '-c', 'PATH1', '--config', 'PATH2',
                           '--ignore-warnings', '--ignore-errors', '--ignore-compiled-code', '--stop-on-error',
                           '--stop-on-warning']);
        cli.on('argsParsed', function (args) {
            expect(args).toEqual({
                configs: [path.resolve('PATH1'), path.resolve('PATH2')],
                ignoreWarnings: true,
                ignoreErrors: true,
                ignoreCompiledCode: true,
                stopOnError: true,
                stopOnWarning: true
            });
            done();
        });
    });

    it('parses -u option', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '-u', 'unit1']);
        cli.on('argsError', fail);
        cli.on('argsParsed', function (options) {
            expect(options).toEqual({filteredUnits: ['unit1']});
            done();
        });
    });

    it('parses --unit option', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--unit', 'unit1']);
        cli.on('argsError', fail);
        cli.on('argsParsed', function (options) {
            expect(options).toEqual({filteredUnits: ['unit1']});
            done();
        });
    });

    it('parses multiple --unit and -u options', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--unit', 'unit1', '-u', 'unit3', '-u', 'unit2',
                           '--unit', 'unit4']);
        cli.on('argsError', fail);
        cli.on('argsParsed', function (options) {
            expect(options).toEqual(jasmine.objectContaining({filteredUnits: jasmine.arrayContaining(
                ['unit1', 'unit2', 'unit3', 'unit4'])}));
            expect(options.filteredUnits.length).toBe(4);
            done();
        });
    });

    it('parses multiple --unit and -u options nad removes duplicates', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--unit', 'unit1', '-u', 'unit3', '-u', 'unit2',
                           '--unit', 'unit4', '-u', 'unit1', '--unit', 'unit3']);
        cli.on('argsError', fail);
        cli.on('argsParsed', function (options) {
            expect(options).toEqual(jasmine.objectContaining({filteredUnits: jasmine.arrayContaining(
                ['unit1', 'unit2', 'unit3', 'unit4'])}));
            expect(options.filteredUnits.length).toBe(4);
            done();
        });
    });

    it('signals argsError in case no value is provided for --unit', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--unit']);
        cli.on('argsError', function (err) {
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
        cli.on('argsParsed', fail);
    });

    it('signals argsError in case no value is provided for -u', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '-u']);
        cli.on('argsError', function (err) {
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
        cli.on('argsParsed', fail);
    });
});
