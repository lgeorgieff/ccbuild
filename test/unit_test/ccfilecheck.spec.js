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
var fs = require('fs');

/**
 * @ignore
 * @suppress {duplicate}
 */
var util = require('util');

/**
 * @ignore
 * @suppress {dupicate}
 */
var mockFs = require('mock-fs');

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
var CCFileCheck = /** @type {function(new:CCFileCheck, Array<string>)} */ (proxyquire('../../src/CCFileCheck.js', {
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

describe('CCFileCheck class', function () {
    it('accepts default parameter when instantiating', function () {
        expect(new CCFileCheck([])).toEqual(jasmine.any(CCFileCheck));
        expect(new CCFileCheck()).toEqual(jasmine.any(CCFileCheck));
        expect(new CCFileCheck(null)).toEqual(jasmine.any(CCFileCheck));
        expect(new CCFileCheck(undefined)).toEqual(jasmine.any(CCFileCheck));
    });

    it('throws in case of bad argument', function () {
        expect(function () { new CCFileCheck({}); }).toThrow(jasmine.any(Error));
        expect(function () { new CCFileCheck(123); }).toThrow(jasmine.any(Error));
        expect(function () { new CCFileCheck('--help'); }).toThrow(jasmine.any(Error));
    });

    it('processes --help', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--help']);
        ccfc.on('help', function (usage) {
            expect(usage).toBe(cliUtils.expectedUsage);
            expect(usage.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes -h', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-h']);
        ccfc.on('help', function (usage) {
            expect(usage).toBe(cliUtils.expectedUsage);
            expect(usage.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --version', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--version']);
        ccfc.on('version', function (version) {
            expect(version).toBe(cliUtils.expectedVersion);
            expect(version.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes -v', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-v']);
        ccfc.on('version', function (version) {
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

            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--closure-help']);
            var eventHandler = jasmine.createSpy('eventHandler');
            ccfc.on('closureHelp', function (closureHelp) {
                expect(closureHelp).toBe(helpText + '\n');
                done();
            });
        });

        it('processes --closure-version', function (done) {
            var versionText = '123';
            runMock = jasmine.createSpy('compiler.run').and.callFake(function (cb) {
                cb(0, versionText, '');
            });

            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--closure-version']);
            ccfc.on('closureVersion', function (closureVersion) {
                expect(closureVersion).toBe(versionText);
                done();
            });
        });

        it('processes --compiler-path', function (done) {
            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--compiler-path']);
            ccfc.on('compilerPath', function (_compilerPath) {
                expect(_compilerPath).toBe(compilerPath);
                done();
            });
        });

        it('processes --contrib-path', function (done) {
            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--contrib-path']);
            ccfc.on('contribPath', function (_contribPath) {
                expect(_contribPath).toBe(contribPath);
                done();
            });
        });
    });

    it('processes --config-help', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--config-help']);
        ccfc.on('configHelp', function (configHelp) {
            expect(configHelp).toBe(cliUtils.expectedConfigHelp);
            expect(configHelp.length).toBeGreaterThan(0);
            done();
        });
    });

    it('emits the event argsError', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--config-hel']);
        ccfc.on('argsError', function (err) {
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(Error));
            done();
        });
    });

    it ('emits the event argsParsed', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1]]);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({});
            done();
        });
    });

    it('processes --ignore-warnings', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--ignore-warnings']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreWarnings: true});
            done();
        });
    });

    it('processes --ignore-errors', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--ignore-errors']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreErrors: true});
            done();
        });
    });

    it('processes --ignore-compiled-code', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--ignore-compiled-code']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({ignoreCompiledCode: true});
            done();
        });
    });

    it('processes --stop-on-error', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--stop-on-error']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnError: true});
            done();
        });
    });

    it('processes --stop-on-warning', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--stop-on-warning']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({stopOnWarning: true});
            done();
        });
    });

    it('processes --config configPath', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--config', 'configPath']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')]});
            done();
        });
    });

    it('processes --ignores-check-fs', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--ignore-check-fs']);
        ccfc.on('done', function (args) {
            done();
        });
    });

    it('processes -c configPath', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', 'configPath']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath')]});
            done();
        });
    });

    it('processes multiple --config and -c options', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2',
                                   '-c', 'configPath3']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2'),
                                            path.resolve('configPath3')]});
            done();
        });
    });

    it('processes duplicate --config and -c options', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--config', 'configPath1', '-c', 'configPath2',
                                   '-c', 'configPath1', '--config', 'configPath2']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({configs: [path.resolve('configPath1'), path.resolve('configPath2')]});
            done();
        });
    });

    it('processes -u and --unit options', function (done) {
        var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-u', 'unit1', '--unit', 'unit2',
                                   '--unit', 'unit3', '-u', 'unit4']);
        ccfc.on('argsParsed', function (args) {
            expect(args).toEqual({filteredUnits: ['unit1', 'unit2', 'unit3', 'unit4']});
            done();
        });
    });

    describe('with file system access', function () {
        beforeAll(function () {
            var config1 = {};
            var config2 = {
                checkFs: {
                    check: []
                }
            };
            var config3 = {
                checkFs: {
                    check: ['.']
                },
                sources: ['source2.js'],
                compilationUnits: {
                    unit1: {
                        sources: ['source1.js']
                    }
                }
            };
            var config4 = {
                checkFs: {
                    check: ['.'],
                    ignore: ['.']
                },
                sources: ['source2.js'],
                compilationUnits: {
                    unit1: {
                        sources: ['source1.js', 'source3.js']
                    }
                }
            };
            var config5 = {
                checkFs: {
                    check: ['.'],
                    fileExtensions: ['.js']
                },
                sources: ['source2.js'],
                compilationUnits: {
                    unit1: {
                        sources: ['source1.js']
                    }
                }
            };
            var config6 = {
                checkFs: {
                    check: ['.']
                },
                compilationUnits: {
                    unit1: {
                        sources: ['.']
                    }
                }
            };
            var config7 = {
                checkFs: {
                    check: ['.'],
                    fileExtensions: ['.js']
                },
                compilationUnits: {
                    unit1: {
                        sources: ['source1.js']
                    }
                }
            };
            var config8 = {
                next: {
                    './config8.ccbuild': {}
                }
            };

            var fakeFs = {
                'dir-1': {
                    'config1.ccbuild': JSON.stringify(config1),
                    'config2.ccbuild': JSON.stringify(config2),
                    'config3.ccbuild': JSON.stringify(config3),
                    'config6.ccbuild': JSON.stringify(config6),
                    'source1.js': '',
                    'source2.js': ''
                },
                'dir-2': {
                    'config3.ccbuild': JSON.stringify(config3),
                    'config4.ccbuild': JSON.stringify(config4),
                    'config5.ccbuild': JSON.stringify(config5),
                    'config7.ccbuild': JSON.stringify(config7),
                    'config8.ccbuild': JSON.stringify(config8),
                    'source1.js': '',
                    'source2.js': '',
                    'source3.js': '',
                    'data1.json': '',
                    'data2.json': ''
                }
            };
            mockFs(fakeFs);
        });

        afterAll(mockFs.restore);

        it('signals done in case no config files are present', function (done) {
            var ccfc = new CCFileCheck([process.argv[0], process.argv[1]]);

            ccfc.on('verificationSuccess', function (f) {
                fail('Did not expect "verificationSuccess" to be fired!');
            });
            ccfc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            ccfc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            ccfc.on('done', function () {
                setTimeout(done, 1000);
            });
        });

        it('signals done in case checkFs is not defined: {', function (done) {
            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', path.join('dir-1', 'config1.ccbuild')]);

            ccfc.on('verificationSuccess', function (f) {
                fail('Did not expect "verificationSuccess" to be fired!');
            });
            ccfc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            ccfc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            ccfc.on('done', function () {
                setTimeout(done, 1000);
            });
        });

        it('signals done in case checkFs.check is empty', function (done) {
            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', path.join('dir-1', 'config2.ccbuild')]);

            ccfc.on('verificationSuccess', function (f) {
                fail('Did not expect "verificationSuccess" to be fired!');
            });
            ccfc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            ccfc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            ccfc.on('done', function () {
                setTimeout(done, 1000);
            });
        });

        it('signals done in case all files have been checked', function (done) {
            var configPath = path.resolve(path.join('dir-1', 'config3.ccbuild'));
            var filesToCheck = [path.resolve(path.join('dir-1', 'source1.js')),
                                path.resolve(path.join('dir-1', 'source2.js'))];

            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', configPath]);
            var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');

            ccfc.on('verificationSuccess', verificationSuccessHandler);
            ccfc.on('verificationError', function (f) {
                fail('Did not expect "verificationError" to be fired!');
            });
            ccfc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            ccfc.on('done', function () {
                expect(verificationSuccessHandler.calls.count()).toBe(filesToCheck.length);
                filesToCheck.forEach(function (fileToCheck) {
                    expect(verificationSuccessHandler).toHaveBeenCalledWith(fileToCheck, configPath);
                });
                done();
            });
        });

        it('signals done in case --ignore-check-fs is set', function (done) {
            var configPath = path.resolve(path.join('dir-2', 'config3.ccbuild'));

            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '--ignore-check-fs']);
            ccfc.on('verificationSuccess', function (err) {
                fail('Did not expect "verificationSuccess" to be fired!');
            });

            ccfc.on('verificationError', function (err) {
                fail('Did not expect "verificationError" to be fired!');
            });

            ccfc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            ccfc.on('done', function () {
                done();
            });
        });

        it('signals verificationError in case multiple files are not in the compilation units', function (done) {
            var configPath = path.resolve(path.join('dir-2', 'config3.ccbuild'));
            var filesNotInUnits = [path.resolve(path.join('dir-2', 'source3.js')),
                                   path.resolve(path.join('dir-2', 'data1.json')),
                                   path.resolve(path.join('dir-2', 'data2.json'))];

            var filesInUnits = [path.resolve(path.join('dir-2', 'source1.js')),
                                path.resolve(path.join('dir-2', 'source2.js'))];

            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', configPath]);
            var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
            ccfc.on('verificationSuccess', verificationSuccessHandler);

            var verificationErrorHandler = jasmine.createSpy('verificationErrorHandler');
            ccfc.on('verificationError', verificationErrorHandler);

            ccfc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            ccfc.on('done', function () {
                expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                filesInUnits.forEach(function (fileToCheck) {
                    expect(verificationSuccessHandler).toHaveBeenCalledWith(fileToCheck, configPath);
                });

                expect(verificationErrorHandler.calls.count()).toBe(filesNotInUnits.length);
                filesNotInUnits.forEach(function (fileToCheck) {
                    expect(verificationErrorHandler).toHaveBeenCalledWith(fileToCheck, configPath);
                });

                done();
            });
        });

        it('does not signal a verificationError in case a file is in a folder that is ignored', function (done) {
            var configPath = path.resolve(path.join('dir-2', 'config4.ccbuild'));
            var filesNotInUnits = [path.resolve(path.join('dir-2', 'source3.js')),
                                   path.resolve(path.join('dir-2', 'data1.json')),
                                   path.resolve(path.join('dir-2', 'data2.json'))];

            var filesInUnits = [path.resolve(path.join('dir-2', 'source1.js')),
                                path.resolve(path.join('dir-2', 'source2.js'))];

            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', configPath]);

            ccfc.on('verificationSuccess', function () {
                fail('Did not expect "verificationSuccess" to be fired!');
            });

            ccfc.on('verificationError', function () {
                fail('Did not expect "verificationError" to be fired!');
            });

            ccfc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            ccfc.on('done', function () {
                done();
            });
        });

        it('does not signal a verificationError in case a file extension is not listed in the file extensions list',
            function (done) {
                var configPath = path.resolve(path.join('dir-2', 'config5.ccbuild'));
                var filesNotInUnits = [path.resolve(path.join('dir-2', 'source3.js'))];
                var filesInUnits = [path.resolve(path.join('dir-2', 'source1.js')),
                                    path.resolve(path.join('dir-2', 'source2.js'))];

                var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', configPath]);
                var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
                ccfc.on('verificationSuccess', verificationSuccessHandler);

                var verificationErrorHandler = jasmine.createSpy('verificationErrorHandler');
                ccfc.on('verificationError', verificationErrorHandler);

                ccfc.on('error', function (err) {
                    fail('Did not expect "error" to be fired!');
                });

                ccfc.on('done', function () {
                    expect(verificationSuccessHandler.calls.count()).toBe(filesInUnits.length);
                    filesInUnits.forEach(function (fileToCheck) {
                        expect(verificationSuccessHandler).toHaveBeenCalledWith(fileToCheck, configPath);
                    });

                    expect(verificationErrorHandler.calls.count()).toBe(filesNotInUnits.length);
                    filesNotInUnits.forEach(function (fileToCheck) {
                        expect(verificationErrorHandler).toHaveBeenCalledWith(fileToCheck, configPath);
                    });

                    done();
                });
            });

        it('does not signal a verificationError in case a file is included in a directory set as filesInUnits',
            function (done) {
                var configPath = path.resolve(path.join('dir-1', 'config6.ccbuild'));
                var filesToCheck = [path.resolve(path.join('dir-1', 'source1.js')),
                                    path.resolve(path.join('dir-1', 'source2.js'))];

                var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', configPath]);
                var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');

                ccfc.on('verificationSuccess', verificationSuccessHandler);
                ccfc.on('verificationError', function (f) {
                    fail('Did not expect "verificationError" to be fired!');
                });
                ccfc.on('error', function (err) {
                    fail('Did not expect "error" to be fired!');
                });

                ccfc.on('done', function () {
                    expect(verificationSuccessHandler.calls.count()).toBe(filesToCheck.length);
                    filesToCheck.forEach(function (fileToCheck) {
                        expect(verificationSuccessHandler).toHaveBeenCalledWith(fileToCheck, configPath);
                    });
                    done();
                });
            });

        it('signals a verificationError in case a file extension is listed in the file extensions list',
            function (done) {
                var configPath = path.resolve(path.join('dir-2', 'config7.ccbuild'));
                var filesInUnit = [path.resolve(path.join('dir-2', 'source1.js'))];
                var filesNotInUnit = [path.resolve(path.join('dir-2', 'source2.js')),
                                      path.resolve(path.join('dir-2', 'source3.js'))];

                var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', configPath]);

                var verificationSuccessHandler = jasmine.createSpy('verificationSuccessHandler');
                ccfc.on('verificationSuccess', verificationSuccessHandler);

                var verificationErrorHandler = jasmine.createSpy('verificationErrorHandler');
                ccfc.on('verificationError', verificationErrorHandler);

                ccfc.on('error', function (err) {
                    fail('Did not expect "error" to be fired!');
                });

                ccfc.on('done', function () {
                    expect(verificationSuccessHandler.calls.count()).toBe(filesInUnit.length);
                    filesInUnit.forEach(function (fileToCheck) {
                        expect(verificationSuccessHandler).toHaveBeenCalledWith(fileToCheck, configPath);
                    });

                    expect(verificationErrorHandler.calls.count()).toBe(filesNotInUnit.length);
                    filesNotInUnit.forEach(function (fileToCheck) {
                        expect(verificationErrorHandler).toHaveBeenCalledWith(fileToCheck, configPath);
                    });

                    done();
                });
            });

        it('signals a circularDependencyError in case of a circular configuration dependency', function (done) {
            var configPath = path.resolve(path.join('dir-2', 'config8.ccbuild'));;

            var ccfc = new CCFileCheck([process.argv[0], process.argv[1], '-c', configPath]);

            ccfc.on('verificationSuccess', function (err) {
                fail('Did not expect "verificationSuccess" to be fired!');
            });

            ccfc.on('verificationError', function (err) {
                fail('Did not expect "verificationError" to be fired!');
            });

            ccfc.on('error', function (err) {
                fail('Did not expect "error" to be fired!');
            });

            var circularDependencyErrorHandler = jasmine.createSpy('circularDependencyErrorHandler');
            ccfc.on('circularDependencyError', circularDependencyErrorHandler);

            ccfc.on('done', function () {
                expect(circularDependencyErrorHandler.calls.count()).toBe(1);
                expect(circularDependencyErrorHandler).toHaveBeenCalledWith(jasmine.any(Error));
                done();
            });
        });
    });
});
