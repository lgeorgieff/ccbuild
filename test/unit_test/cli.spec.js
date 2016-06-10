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
var proxyquire = require('proxyquire');

var compilerPath = 'compiler/path';
var contribPath = 'contrib/path';
function CC (compilerArguments) { }
CC.prototype.run = function (cb) {};

var CCMock = {
    compiler: CC,
    grunt: undefined,
    gulp: undefined
};

var PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
var rpjMock = function (packageJson, cb) {
    cb(undefined, PACKAGE_JSON);
};

/**
 * @ignore
 * @suppress {duplicate}
 */
var CLI = /** @type {function(new:CLI, Array<string>)} */ (proxyquire('../../src/CLI.js', {
    'google-closure-compiler': CCMock,
    'read-package-json': rpjMock
}));

/**
 * @ignore
 * @suppress {duplicate}
 */
var cliUtils = require('../utils/cliUtils.js');

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

    describe('with google-closure-compiler mock', function () {
        var runMock;

        beforeEach(function () {
            runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                cb(0, '', '');
            });
            CCMock.compiler = jasmine.createSpy('compiler').and.callFake(function (compilerArguments) {
                var cc = new CC(compilerArguments);
                cc.run = runMock;
                return cc;
            });

            CCMock.compiler.COMPILER_PATH = compilerPath;
            CCMock.compiler.CONTRIB_PATH = contribPath;
        });

        it('processes --closure-help', function (done) {
            var helpText = 'some help';
            runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                cb(0, helpText, '');
            });

            var cli = new CLI([process.argv[0], process.argv[1], '--closure-help']);
            var eventHandler = jasmine.createSpy('eventHandler');
            cli.on('closureHelp', function (closureHelp) {
                expect(closureHelp).toBe(helpText + '\n');
                done();
            });
        });

        it('processes --closure-version', function (done) {
            var versionText = '123';
            runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                cb(0, versionText, '');
            });

            var cli = new CLI([process.argv[0], process.argv[1], '--closure-version']);
            cli.on('closureVersion', function (closureVersion) {
                expect(closureVersion).toBe(versionText);
                done();
            });
        });

        it('processes --compiler-path', function (done) {
            var cli = new CLI([process.argv[0], process.argv[1], '--compiler-path']);
            cli.on('compilerPath', function (_compilerPath) {
                expect(_compilerPath).toBe(compilerPath);
                done();
            });
        });

        it('processes --contrib-path', function (done) {
            var cli = new CLI([process.argv[0], process.argv[1], '--contrib-path']);
            cli.on('contribPath', function (_contribPath) {
                expect(_contribPath).toBe(contribPath);
                done();
            });
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

    it('parses multiple --unit and -u options and removes duplicates', function (done) {
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

    it('parses -n option', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '-n', 'next1']);
        cli.on('argsError', fail);
        cli.on('argsParsed', function (options) {
            expect(options).toEqual({filteredNextEntries: [path.resolve('next1')]});
            done();
        });
    });

    it('parses --next option', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--next', 'next1']);
        cli.on('argsError', fail);
        cli.on('argsParsed', function (options) {
            expect(options).toEqual({filteredNextEntries: [path.resolve('next1')]});
            done();
        });
    });

    it('parses multiple --next and -n options', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--next', path.join('/', 'abc', 'def', 'next1'), '-n',
                           path.join('ghi', 'next3'), '-n', 'next2', '--next', 'next4']);
        cli.on('argsError', fail);
        cli.on('argsParsed', function (options) {
            expect(options).toEqual(jasmine.objectContaining({filteredNextEntries: jasmine.arrayContaining(
                [path.join('/', 'abc', 'def', 'next1'), path.resolve('next2'), path.resolve('ghi', 'next3'),
                 path.resolve('next4')])}));
            expect(options.filteredNextEntries.length).toBe(4);
            done();
        });
    });

    it('parses multiple --next and -n options and removes duplicates', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--next', 'next1', '-n', 'next3', '-n', 'next2',
                           '--next', 'next4', '-n', 'next1', '--next', 'next3', '-n', path.join('ghi', 'next3'),
                           '--next', path.join('/', 'abc', 'def', 'next1')]);
        cli.on('argsError', fail);
        cli.on('argsParsed', function (options) {
            expect(options).toEqual(jasmine.objectContaining({filteredNextEntries: jasmine.arrayContaining(
                [path.resolve('next1'), path.resolve('next2'), path.resolve('next3'), path.resolve('next4'),
                 path.resolve('ghi', 'next3'), path.resolve('next4')])}));
            expect(options.filteredNextEntries.length).toBe(6);
            done();
        });
    });

    it('signals argsError in case no value is provided for --next', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '--next']);
        cli.on('argsError', function (err) {
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
        cli.on('argsParsed', fail);
    });

    it('signals argsError in case no value is provided for -n', function (done) {
        var cli = new CLI([process.argv[0], process.argv[1], '-n']);
        cli.on('argsError', function (err) {
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
        cli.on('argsParsed', fail);
    });
});
