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
 * @suppress {duplicate}
 */
var CC = require('google-closure-compiler');

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

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('CCBuild class', function () {
    beforeEach(function () {
        this.resourcesToDelete = [];
    });

    afterEach(function () {
        if (util.isArray(this.resourcesToDelete)) {
            this.resourcesToDelete.forEach(function (resource) {
                try {
                    if (fs.statSync(resource).isDirectory()) fs.rmdirSync(resource);
                    else fs.unlinkSync(resource);
                } catch (err) {
                    console.error(err);
                }
            });
        }
    });

    it('processes --closure-help', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--closure-help']);
        var eventHandler = jasmine.createSpy('eventHandler');
        ccbuild.on('closureHelp', function (closureHelp) {
            expect(closureHelp.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --closure-version', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--closure-version']);
        ccbuild.on('closureVersion', function (closureVersion) {
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
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--compiler-path']);
        ccbuild.on('compilerPath', function (compilerPath) {
            expect(compilerPath).toBe(CC.compiler.COMPILER_PATH);
            expect(compilerPath.length).toBeGreaterThan(0);
            done();
        });
    });

    it('processes --contrib-path', function (done) {
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--contrib-path']);
        ccbuild.on('contribPath', function (contribPath) {
            expect(contribPath).toBe(CC.compiler.CONTRIB_PATH);
            expect(contribPath.length).toBeGreaterThan(0);
            done();
        });
    });

    it('emits done after finished with config -- 1 compilation unit', function (done) {
        var config = {
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
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        ccbuild.on('compiled', function (compilationName, stdout, stderr) {
            ccbuild.on('done', done);
        });
        this.resourcesToDelete.push(configPath);
    });

    it('emits done after finished with config -- 1 errornous compilation unit', function (done) {
        var config = {
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

        var configPath = path.join(__dirname, 'config2.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        var compilationErrordHandler = jasmine.createSpy('compilationErrorHandler');
        ccbuild.on('compilationError', compilationErrordHandler);
        ccbuild.on('done', function () {
            expect(compilationErrordHandler.calls.count()).toBe(1);
            done();
        });
        this.resourcesToDelete.push(configPath);
    });

    it('emits done after finished with config -- 3 compilation units', function (done) {
        var config = {
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
                    sources: ['data/source2.js'],
                    externs: ['./data/externs2.js']
                },
                unit3: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config2.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        var compiledHandler = jasmine.createSpy('compiledHandler');
        ccbuild.on('compiled', compiledHandler);
        ccbuild.on('done', function () {
            expect(compiledHandler.calls.count()).toBe(3);
            done();
        });

        this.resourcesToDelete.push(configPath);
    });

    it('emits done after finished with config -- 3 compilation units incl. error', function (done) {
        var config = {
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

        var configPath = path.join(__dirname, 'config3.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        var compiledHandler = jasmine.createSpy('compiledHandler');
        var compilationErrorHandler = jasmine.createSpy('compilationErrorHandler');
        ccbuild.on('compiled', compiledHandler);
        ccbuild.on('compilationError', compilationErrorHandler);
        ccbuild.on('done', function () {
            expect(compiledHandler.calls.count()).toBe(2);
            expect(compilationErrorHandler.calls.count()).toBe(1);
            done();
        });
        this.resourcesToDelete.push(configPath);
    });

    it('emits done after finished with multiple configs -- 4 compilation units', function (done) {
        var configPath1 = path.join(__dirname, 'config4.ccbuild');
        var configPath2 = path.join(__dirname, 'data', 'config5.ccbuild');
        var configPath3 = path.join(__dirname, 'data', 'configs', 'config6.ccbuild');
        var temporaryConfigDirectory = path.join(__dirname, 'data', 'configs');
        try {
            fs.mkdirSync(temporaryConfigDirectory);
        } catch (err) {
            console.error(err);
        }

        var config1 = {
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
            next: {}
        };
        config1.next[path.relative(path.dirname(configPath1), configPath2)] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config2 = {
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit2: {
                    sources: ['source2.js'],
                    externs: ['./externs2.js'],
                    buildOptions: ['--flagfile', './test_flagfile']
                }
            },
            next: {}
        };
        config2.next[path.relative(path.dirname(configPath2), configPath3)] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config3 = {
            sources: ['../source1.js'],
            externs: ['../externs1.js'],
            buildOptions: config1.buildOptions,
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

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath1]);
        var compiledHandler = jasmine.createSpy('compiledHandler');
        ccbuild.on('compiled', compiledHandler);
        ccbuild.on('done', function () {
            expect(compiledHandler.calls.count()).toBe(4);
            done();
        });

        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('emits done after finished with multiple configs -- 4 compilation units incl. errors', function (done) {
        var configPath1 = path.join(__dirname, 'config7.ccbuild');
        var configPath2 = path.join(__dirname, 'data', 'config8.ccbuild');
        var configPath3 = path.join(__dirname, 'data', 'configs', 'config9.ccbuild');
        var temporaryConfigDirectory = path.join(__dirname, 'data', 'configs');
        try {
            fs.mkdirSync(temporaryConfigDirectory);
        } catch (err) {
            console.error(err);
        }

        var config1 = {
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
            next: {}
        };
        config1.next[path.relative(path.dirname(configPath1), configPath2)] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config2 = {
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit2: {
                    sources: ['source2.js'],
                    buildOptions: ['--flagfile', './test_flagfile']
                }
            },
            next: {}
        };
        config2.next[path.relative(path.dirname(configPath2), configPath3)] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config3 = {
            sources: ['../source1.js'],
            externs: ['../externs1.js'],
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit3: {
                    sources: ['../source3.js', '../source4.js'],
                    buildOptions: ['--flagfile', '../test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', '../test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

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

        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('emits done after finished with config including variables -- 1 compilation unit', function (done) {
        var whitelistPath = path.join(__dirname, 'whitelist.txt');
        var jsPath = path.join(__dirname, 'data', 'source5.js');
        var whitelistContent = jsPath + ':  constant os assigned a value more than once.';

        var config = {
            compilationUnits: {
                unit1: {
                    sources: ['${CWD}' + path.sep + 'test' + path.sep + 'system_test' + path.sep + 'data' + path.sep +
                              'source5.js'],
                    externs: [path.join('data', 'externs4.js'),
                              '${CONTRIB_PATH}' + path.sep + 'nodejs' + path.sep + 'os.js'],
                    buildOptions: [
                        '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                        '--warning_level', 'VERBOSE',
                        '--env', 'CUSTOM',
                        '--flagfile', './data/test_flagfile',
                        '--warnings_whitelist_file', whitelistPath
                    ]
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        fs.writeFileSync(whitelistPath, whitelistContent);
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        ccbuild.on('compiled', function (compilationName, stdout, stderr) {
            expect(stdout.length).toBeGreaterThan(0);
            expect(stderr.length).toBeGreaterThan(0);
            ccbuild.on('done', done);
        });
        ccbuild.on('configError', function (err) {
            fail(err);
        });
        this.resourcesToDelete.push(configPath, whitelistPath);
    }, 5000);

    it('emits done after finished with config including variables -- 1 compilation unit', function (done) {
        var config = {
            compilationUnits: {
                unit1: {
                    sources: [path.join('data', 'source5.js')],
                    externs: [path.join('data', 'externs4.js'),
                              '${SOME_NON_EXISTING_PATH}' + path.sep + 'nodejs' + path.sep + 'os.js'],
                    buildOptions: [
                        '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                        '--warning_level', 'VERBOSE',
                        '--env', 'CUSTOM',
                        '--flagfile', './data/test_flagfile'
                    ]
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        var ccbuild = new CCBuild([process.argv[0], process.argv[1], '--config', configPath]);
        ccbuild.on('compiled', function (compilationName, stdout, stderr) {
            fail('Expected compilation process to fail');
        });
        ccbuild.on('configError', function (err) {
            expect(err).toEqual(jasmine.any(Error));
            ccbuild.on('done', done);
        });
        this.resourcesToDelete.push(configPath);
    });
});
