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
var path = require('path');

/**
 * @ignore
 * @suppress {duplicate}
 */
var CCBuild = /** @type {function(new:CCBuild, Array<string>)} */ (require('../../src/CCBuild.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var cliUtils = require('../utils/cliUtils.js');

describe('CCBuild class', function () {
    it('accepts default parameter when instantiating', function () {
        expect(new CCBuild([])).toEqual(jasmine.any(CCBuild));
        expect(new CCBuild()).toEqual(jasmine.any(CCBuild));
        expect(new CCBuild(null)).toEqual(jasmine.any(CCBuild));
        expect(new CCBuild(undefined)).toEqual(jasmine.any(CCBuild));
    });

    it('throws in case of bad argument', function () {
        expect(function () { new CCBuild({}); }).toThrow(jasmine.any(Error));
        expect(function () { new CCBuild(123); }).toThrow(jasmine.any(Error));
        expect(function () { new CCBuild('--help'); }).toThrow(jasmine.any(Error));
    });

    it('processes --help', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--help']);
        ccbuild.on('help', function (usage) {
            expect(usage).toBe(cliUtils.expectedUsage);
            expect(usage.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes -h', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-h']);
        ccbuild.on('help', function (usage) {
            expect(usage).toBe(cliUtils.expectedUsage);
            expect(usage.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --version', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--version']);
        ccbuild.on('version', function (version) {
            expect(version).toBe(cliUtils.expectedVersion);
            expect(version.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes -v', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-v']);
        ccbuild.on('version', function (version) {
            expect(version).toBe(cliUtils.expectedVersion);
            expect(version.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --config-help', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config-help']);
        ccbuild.on('configHelp', function (configHelp) {
            expect(configHelp).toBe(cliUtils.expectedConfigHelp);
            expect(configHelp.length).toBeGreaterThan(0);
            done();
        });
    });

    it('emits the event argsError', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config-hel']);
        ccbuild.on('argsError', function (err) {
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
    });

    it ('emits the event argsParsed', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1]]);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({});
            done();
        });
    });

    it('processes --ignore-warnings', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-warnings']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreWarnings: true});
            done();
        });
    });

    it('processes --ignore-errors', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-errors']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreErrors: true});
            done();
        });
    });

    it('processes --ignore-compiled-code', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-compiled-code']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreCompiledCode: true});
            done();
        });
    });

    it('processes --stop-on-error', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--stop-on-error']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnError: true});
            done();
        });
    });

    it('processes --stop-on-warning', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--stop-on-warning']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnWarning: true});
            done();
        });
    });

    it('processes --config configPath', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')]});
            done();
        });
    });

    it('processes -c configPath', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-c', 'configPath']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')]});
            done();
        });
    });

    it('processes multiple --config and -c options', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2',
                                   '-c', 'configPath3']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2'),
                                            path.resolve('configPath3')]});
            done();
        });
    });

    it('processes duplicate --config and -c options', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2',
                                   '-c', 'configPath1', '--config', 'configPath2']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2')]});
            done();
        });
    });

    it('processes -u and --unit options', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-u', 'unit1', '--unit', 'unit2',
                                   '--unit', 'unit3', '-u', 'unit4']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({filteredUnits: ['unit1', 'unit2', 'unit3', 'unit4']});
            done();
        });
    });

    it ('emits the event argsParsed with a proper args object', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-c', 'PATH1', '--config', 'PATH2',
                                   '--ignore-warnings', '--ignore-errors', '--ignore-compiled-code', '--stop-on-error',
                                   '--stop-on-warning', '--unit', 'unit1', '-u', 'unit2']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({
                configs: [path.resolve('PATH1'), path.resolve('PATH2')],
                ignoreWarnings: true,
                ignoreErrors: true,
                ignoreCompiledCode: true,
                stopOnError: true,
                stopOnWarning: true,
                filteredUnits: ['unit1', 'unit2']
            });
            done();
        });
    });
});
