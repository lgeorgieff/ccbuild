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
var mockFs = require('mock-fs');

/**
 * @ignore
 * @suppress {duplicate}
 */
var proxyquire = require('proxyquire');

/**
 * @ignore
 * @suppress {duplicate}
 */
var fs = require('fs');

var compilerPath = 'compiler/path';
var contribPath = 'contrib/path';
function CC (compilerArguments) { }
CC.prototype.run = function (cb) {};
CC.COMPILER_PATH = compilerPath;
CC.CONTRIB_PATH = contribPath;

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
var CCBuild = /** @type {function(new:CCBuild, Array<string>)} */ (proxyquire('../../src/CCBuild.js', {
    'google-closure-compiler': CCMock,
    './CLI.js': proxyquire('../../src/CLI.js', {
        'google-closure-compiler': CCMock,
        'read-package-json': rpjMock
    })
}));

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
            expect(args).toEqual({cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes --ignore-warnings', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-warnings']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreWarnings: true, cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes --ignore-errors', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-errors']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreErrors: true, cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes --ignore-compiled-code', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--ignore-compiled-code']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreCompiledCode: true, cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes --stop-on-error', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--stop-on-error']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnError: true, cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes --stop-on-warning', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--stop-on-warning']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnWarning: true, cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes --config configPath', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')], cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes -c configPath', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-c', 'configPath']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')], cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes multiple --config and -c options', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2',
                                   '-c', 'configPath3']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2'),
                                            path.resolve('configPath3')],
                                  cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes duplicate --config and -c options', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2',
                                   '-c', 'configPath1', '--config', 'configPath2']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2')],
                                  cacheLocation: path.resolve('.ccbuild')});
            done();
        });
    });

    it('processes -u and --unit options', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '-u', 'unit1', '--unit', 'unit2',
                                   '--unit', 'unit3', '-u', 'unit4']);
        ccbuild.on('argsParsed', function (args) {
            expect(args).toEqual({filteredUnits: ['unit1', 'unit2', 'unit3', 'unit4'],
                                  cacheLocation: path.resolve('.ccbuild')});
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
                filteredUnits: ['unit1', 'unit2'],
                cacheLocation: path.resolve('.ccbuild')
            });
            done();
        });
    });

    describe('with google-closure-compiler-mock', function () {
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

            var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--closure-help']);
            var eventHandler = jasmine.createSpy('eventHandler');
            ccbuild.on('closureHelp', function (closureHelp) {
                expect(closureHelp).toBe(helpText + '\n');
                done();
            });
        });

        it('processes --closure-version', function (done) {
            runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                cb(0, '1234', '');
            });

            var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--closure-version']);
            ccbuild.on('closureVersion', function (closureVersion) {
                expect(CCMock.compiler).toHaveBeenCalledWith(['--version']);
                expect(closureVersion).toBe('1234');
                done();
            });
        });

        it('processes --compiler-path', function (done) {
            CCMock.compiler.COMPILER_PATH = compilerPath;
            var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--compiler-path']);
            ccbuild.on('compilerPath', function (_compilerPath) {
                expect(_compilerPath).toBe(compilerPath);
                done();
            });
        });

        it('processes --contrib-path', function (done) {
            CCMock.compiler.CONTRIB_PATH = contribPath;
            var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--contrib-path']);
            ccbuild.on('contribPath', function (_contribPath) {
                expect(_contribPath).toBe(contribPath);
                done();
            });
        });

        describe('with fs-mock', function () {
            beforeAll(function () {
                var config2 = {
                    sources: ['./data/source4.js'],
                    buildOptions: [
                        '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                        '--warning_level', 'VERBOSE',
                        '--env', 'CUSTOM',
                        '--flagfile', './data/test_flagfile'
                    ],
                    compilationUnits: {
                        unit1: {
                        }
                    }
                };
                var config3 = {
                    sources: ['./data/source1.js'],
                    externs: ['data/externs1.js'],
                    buildOptions: [
                        '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                        '--warning_level', 'VERBOSE',
                        '--env', 'CUSTOM',
                        '--flagfile', './data/test_flagfile'
                    ],
                    compilationUnits: {
                        unit1: {
                        },
                        unit2: {
                            sources: ['data/source2.js']
                        },
                        unit3: {
                            sources: ['./data/source3.js', './data/source4.js'],
                            externs: ['./data/externs2.js', 'data/externs3.js']
                        }
                    }
                };
                var config4 = {
                    sources: ['./data/source1.js'],
                    externs: ['data/externs1.js'],
                    buildOptions: [
                        '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                        '--warning_level', 'VERBOSE',
                        '--env', 'CUSTOM'
                    ],
                    compilationUnits: {
                        unit1: {
                            buildOptions: ['--flagfile', './data/test_flagfile']
                        }
                    },
                    next: {
                        'data/config5.ccbuild': {
                            inheritSources: true,
                            inheritExterns: true,
                            inheritBuildOptions: true,
                            inheritWarningsFilterFile: true
                        }
                    }
                };
                var config5 = {
                    buildOptions: config4.buildOptions,
                    compilationUnits: {
                        unit2: {
                            sources: ['source2.js'],
                            externs: ['./externs2.js'],
                            buildOptions: ['--flagfile', './test_flagfile']
                        }
                    },
                    next: {
                        'configs/config6': {
                            inheritSources: true,
                            inheritExterns: true,
                            inheritBuildOptions: true
                        }
                    }
                };
                var config6 = {
                    sources: ['../source1.js'],
                    externs: ['../externs1.js'],
                    buildOptions: config4.buildOptions,
                    compilationUnits: {
                        unit3: {
                            sources: ['../source3.js', '../source4.js'],
                            externs: ['../externs2.js', '../externs3.js'],
                            buildOptions: ['--flagfile', '../test_flagfile']
                        },
                        unit4: {
                            sources: ['../source3.js', '../source4.js'],
                            externs: ['../externs2.js', '../externs3.js'],
                            buildOptions: ['--flagfile', '../test_flagfile']
                        }
                    }
                };

                var fakeFs = {
                    'test/unit_test/': {
                        'config2.ccbuild': JSON.stringify(config2, null, 2),
                        'config3.ccbuild': JSON.stringify(config3, null, 2),
                        'config4.ccbuild': JSON.stringify(config4, null, 2),
                        data: {
                            'config5.ccbuild': JSON.stringify(config5, null, 2),
                            configs: {
                                'config6': JSON.stringify(config6, null, 2)
                            }
                        }
                    }
                };
                mockFs(fakeFs);
            });

            afterAll(function () {
                mockFs.restore();
            });

            it('emits done after finished with config -- 1 errornous compilation unit', function (done) {
                runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                    cb(1, '', 'an error');
                });

                var configPath = path.join(__dirname, 'config2.ccbuild');
                var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
                var compilationErrordHandler = jasmine.createSpy('compilationErrorHandler');
                ccbuild.on('compilationError', compilationErrordHandler);
                ccbuild.on('done', function () {
                    expect(compilationErrordHandler.calls.count()).toBe(1);
                    expect(compilationErrordHandler).toHaveBeenCalledWith('unit1', jasmine.any(Error));
                    expect(CCMock.compiler.calls.count()).toBe(1);
                    expect(CCMock.compiler).toHaveBeenCalledWith(jasmine.arrayContaining([
                        '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                        '--warning_level', 'VERBOSE',
                        '--env', 'CUSTOM',
                        '--flagfile', './data/test_flagfile',
                        '--js', path.join('test', 'unit_test', 'data', 'source4.js')]));
                    done();
                });
            });

            it('emits done after finished with config -- 3 compilation units incl. error', function (done) {
                var callCount = 0;
                runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                    if (callCount < 2) cb(0, '', '');
                    if (callCount >= 2) cb(1, '', 'an error');
                    ++callCount;
                });

                var configPath = path.join(__dirname, 'config3.ccbuild');
                var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);

                var compiledHandler = jasmine.createSpy('compiledHandler');
                var compilationErrorHandler = jasmine.createSpy('compilationErrorHandler');
                ccbuild.on('compiled', compiledHandler);
                ccbuild.on('compilationError', compilationErrorHandler);
                ccbuild.on('done', function () {
                    expect(compiledHandler.calls.count()).toBe(2);
                    expect(compiledHandler)
                        .toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), jasmine.any(String));
                    expect(compilationErrorHandler.calls.count()).toBe(1);
                    expect(compilationErrorHandler).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Error));
                    done();
                });
            });

            it('emits done after finished with multiple configs -- 4 compilation units', function (done) {
                runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                    cb(0, '', '');
                });

                var configPath1 = path.join(__dirname, 'config4.ccbuild');

                var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath1]);
                var compiledHandler = jasmine.createSpy('compiledHandler');
                ccbuild.on('compiled', compiledHandler);
                ccbuild.on('done', function () {
                    expect(compiledHandler.calls.count()).toBe(4);
                    expect(compiledHandler).toHaveBeenCalledWith('unit1', jasmine.any(String), jasmine.any(String));
                    expect(compiledHandler).toHaveBeenCalledWith('unit2', jasmine.any(String), jasmine.any(String));
                    expect(compiledHandler).toHaveBeenCalledWith('unit3', jasmine.any(String), jasmine.any(String));
                    expect(compiledHandler).toHaveBeenCalledWith('unit4', jasmine.any(String), jasmine.any(String));
                    done();
                });
            });

            it('emits done after finished with multiple configs -- 4 compilation units & 1x --next NEXT_ENTRY',
               function (done) {
                   runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                       cb(0, '', '');
                   });

                   var configPath1 = path.join(__dirname, 'config4.ccbuild');

                   var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath1,
                                              '--next', 'does/not/exist']);
                   var compiledHandler = jasmine.createSpy('compiledHandler');
                   ccbuild.on('compiled', compiledHandler);
                   ccbuild.on('done', function () {
                       expect(compiledHandler.calls.count()).toBe(1);
                       expect(compiledHandler).toHaveBeenCalledWith('unit1', jasmine.any(String), jasmine.any(String));
                       done();
                   });
               });

            it('emits done after finished with multiple configs -- 4 compilation units & 2x --next NEXT_ENTRY',
               function (done) {
                   runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                       cb(0, '', '');
                   });

                   var configPath1 = path.join(__dirname, 'config4.ccbuild');

                   var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath1,
                                              '--next', 'does/not/exist',
                                              '-n', path.join('test', 'unit_test', 'data', 'config5.ccbuild')]);
                   var compiledHandler = jasmine.createSpy('compiledHandler');
                   ccbuild.on('compiled', compiledHandler);
                   ccbuild.on('done', function () {
                       expect(compiledHandler.calls.count()).toBe(2);
                       expect(compiledHandler).toHaveBeenCalledWith('unit1', jasmine.any(String), jasmine.any(String));
                       expect(compiledHandler).toHaveBeenCalledWith('unit2', jasmine.any(String), jasmine.any(String));
                       done();
                   });
               });

            it('emits done after finished with multiple configs -- 4 compilation units & 3x --next NEXT_ENTRY',
               function (done) {
                   runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                       cb(0, '', '');
                   });

                   var configPath1 = path.join('test', 'unit_test', 'config4.ccbuild');

                   var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath1,
                                              '--next', 'does/not/exist',
                                              '-n', path.join('test', 'unit_test', 'data', 'config5.ccbuild'),
                                              '-n', path.join('test', 'unit_test', 'data', 'configs', 'config6')]);
                   var compiledHandler = jasmine.createSpy('compiledHandler');
                   ccbuild.on('compiled', compiledHandler);
                   ccbuild.on('done', function () {
                       expect(compiledHandler.calls.count()).toBe(4);
                       expect(compiledHandler).toHaveBeenCalledWith('unit1', jasmine.any(String), jasmine.any(String));
                       expect(compiledHandler).toHaveBeenCalledWith('unit2', jasmine.any(String), jasmine.any(String));
                       expect(compiledHandler).toHaveBeenCalledWith('unit3', jasmine.any(String), jasmine.any(String));
                       expect(compiledHandler).toHaveBeenCalledWith('unit4', jasmine.any(String), jasmine.any(String));
                       done();
                   });
               });

            it('emits done after finished with multiple configs -- 4 compilation units incl. errors', function (done) {
                var callCount = 0;
                runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                    if (callCount < 2) cb(0, '', '');
                    if (callCount >= 2) cb(1, '', 'an error');
                    ++callCount;
                });

                var configPath1 = path.join(__dirname, 'config4.ccbuild');

                var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath1]);
                var compiledHandler = jasmine.createSpy('compiledHandler');
                ccbuild.on('compiled', compiledHandler);
                var compilationErrorHandler = jasmine.createSpy('compilationErrorHandler');
                ccbuild.on('compilationError', compilationErrorHandler);
                ccbuild.on('done', function () {
                    expect(compiledHandler.calls.count()).toBe(2);
                    expect(compilationErrorHandler.calls.count()).toBe(2);
                    done();
                });
            });
        });
    });
});
