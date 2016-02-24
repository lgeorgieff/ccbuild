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
var CCBuild = /** @type {function(new:CCBuild, Array<string>)} */ (require('../../src/CCBuild.js'));

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/**
 * @ignore
 * @suppress {duplicate}
 */
var child_process = require('child_process');
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('ccbuild', function () {
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

    it('instantiate CCBuild', function () {
        expect(new CCBuild([])).toEqual(jasmine.any(CCBuild));
        expect(function () { new CCBuild({}); }).toThrow(jasmine.any(Error));
        expect(function () { new CCBuild(null); }).toThrow(jasmine.any(Error));
        expect(function () { new CCBuild(123); }).toThrow(jasmine.any(Error));
        expect(function () { new CCBuild('--help'); }).toThrow(jasmine.any(Error));
        expect(function () { new CCBuild(); }).toThrow(jasmine.any(Error));
    });

    it('compile with single config -- success', function (done) {
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

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --config ./test/unit_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit2 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit3 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with single config -- success & --ignore-warnings', function (done) {
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

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --ignore-warnings --config ./test/unit_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit2 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit3 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBe(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with single config -- error', function (done) {
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
                    sources: ['data/source2.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --config ./test/unit_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(err).toEqual(jasmine.any(Error));
                                   expect(stdout.length).toBe(0);
                                   expect(stderr.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with single config -- error & --ignore-errors & 1 unit', function (done) {
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
                    sources: ['data/source2.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --ignore-errors --config ./test/unit_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(err).toEqual(jasmine.any(Error));
                                   expect(stdout.length).toBe(0);
                                   expect(stderr.length).toBe(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with single config -- error & --ignore-errors & 2 units', function (done) {
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
                unit1: {},
                unit2: {
                    sources: ['data/source2.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --ignore-errors --config ./test/unit_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(err).toEqual(jasmine.any(Error));
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBe(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with multiple default configs', function (done) {
        var config1 = {
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
        var config2 = {
            sources: config1.sources,
            externs: config1.externs,
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit2: {
                    sources: ['data/source2.js'],
                    externs: ['./data/externs2.js']
                }
            }
        };
        var config3 = {
            sources: config1.sources,
            externs: config1.externs,
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit3: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };
        var configPath1 = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        var configPath2 = path.join(__dirname, 'config2.ccbuild');
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        var configPath3 = path.join(__dirname, 'config3.ccbuild');
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ../../src/bin.js', {cwd: __dirname},
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit2 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit3 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
    });

    it('compile with config and default config', function (done) {
        var config1 = {
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
        var config2 = {
            sources: config1.sources,
            externs: config1.externs,
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit2: {
                    sources: ['data/source2.js'],
                    externs: ['./data/externs2.js']
                }
            }
        };
        var config3 = {
            sources: config1.sources,
            externs: config1.externs,
            buildOptions: config1.buildOptions,
            compilationUnits: {
                unit3: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };
        var configPath1 = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        var configPath2 = path.join(__dirname, 'config2');
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        var configPath3 = path.join(__dirname, 'config3');
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ../../src/bin.js -c ' + configPath2 + ' --config ' + configPath3, {cwd: __dirname},
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).toBe(-1);
                                   expect(stdout.indexOf('=== unit2 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit3 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
    });

    it('compile with mulit-level inheritance -- success ', function (done) {
        var configPath1 = path.join(__dirname, 'config1.ccbuild');
        var configPath2 = path.join(__dirname, 'config2');
        var configPath3 = path.join(__dirname, 'config3');

        var config1 = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM'
            ],
            next: {}
        };
        config1.next[configPath2] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config2 = {
            externs: ['./data/externs2.js'],
            buildOptions: ['--flagfile', './data/test_flagfile'],
            next: {}
        };
        config2.next[configPath3] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config3 = {
            compilationUnits: {
                unit1: {
                    sources: ['data/source2.js']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
    });

    it('compile with mulit-level inheritance -- error ', function (done) {
        var configPath1 = path.join(__dirname, 'config1.ccbuild');
        var configPath2 = path.join(__dirname, 'config2');
        var configPath3 = path.join(__dirname, 'config3');

        var config1 = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM'
            ],
            next: {}
        };
        config1.next[configPath2] = {
            inheritSources: true,
            inheritExterns: false,
            inheritBuildOptions: true
        };
        var config2 = {
            externs: ['./data/externs2.js'],
            buildOptions: ['--flagfile', './data/test_flagfile'],
            next: {}
        };
        config2.next[configPath3] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var config3 = {
            compilationUnits: {
                unit1: {
                    sources: ['data/source2.js']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(err).toEqual(jasmine.any(Error));
                                   expect(stderr.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
    });

    it('compile with config hierarchy -- success', function (done) {
        var configPath1 = path.join(__dirname, 'config1.ccbuild');
        var configPath2 = path.join(__dirname, 'data', 'config2.ccbuild');
        var configPath3 = path.join(__dirname, 'data', 'configs', 'config3.ccbuild');
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

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit2 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit3 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit4 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('compile with config hierarchy -- error', function (done) {
        var configPath1 = path.join(__dirname, 'config1.ccbuild');
        var configPath2 = path.join(__dirname, 'data', 'config2.ccbuild');
        var configPath3 = path.join(__dirname, 'data', 'configs', 'config3.ccbuild');
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
            inheritExterns: false,
            inheritBuildOptions: true
        };
        var config2 = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
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

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(err).toEqual(jasmine.any(Error));
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.indexOf('=== unit2 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.indexOf('=== unit3 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit4 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('compile with circular config hierarchy', function (done) {
        var configPath1 = path.join(__dirname, 'config1.ccbuild');
        var configPath2 = path.join(__dirname, 'data', 'config2.ccbuild');
        var configPath3 = path.join(__dirname, 'data', 'configs', 'config3.ccbuild');
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
            inheritExterns: false,
            inheritBuildOptions: true
        };
        var config2 = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
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
                }
            },
            next: {}
        };
        config3.next[configPath3] = {};

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(err).toEqual(jasmine.any(Error));
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.indexOf('=== unit2 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit3 =================================================' +
                                                         '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   expect(stderr.indexOf('Discovered circular dependency to "' + configPath3 + '"!'))
                                       .not.toBe(-1);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('compile with --ignore-compiled-code -- success', function (done) {
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
                unit3: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --config ./test/unit_test/config1.ccbuild --ignore-compiled-code',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBe(0);
                                   expect(stderr.length).toBe(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with --ignore-compiled-code -- warning', function (done) {
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

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --config ./test/unit_test/config1.ccbuild --ignore-compiled-code',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout).toBe('=== unit2 ===================================================' +
                                                       '==================\n');
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with --ignore-compiled-code -- warning & --ignore-warnings', function (done) {
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

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --config ./test/unit_test/config1.ccbuild --ignore-compiled-code ' +
                           '--ignore-warnings',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBe(0);
                                   expect(stderr.length).toBe(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with --ignore-compiled-code -- error', function (done) {
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

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --config ./test/unit_test/config1.ccbuild --ignore-compiled-code',
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(stderr.indexOf('=== unit2 =================================================' +
                                                         '====================\n')).toBe(0);
                                   expect(stdout.length).toBe(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with --stop-on-error -- error', function (done) {
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
                    sources: ['data/source2.js']
                },
                unit2: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --config ./test/unit_test/config1.ccbuild --ignore-compiled-code',
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(stderr.indexOf('=== unit1 =================================================' +
                                                         '====================\n')).toBe(0);
                                   expect(stdout.length).toBe(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with --stop-on-error -- no-error', function (done) {
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
                    externs: ['data/externs2.js']
                },
                unit3: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --config ./test/unit_test/config1.ccbuild --stop-on-error',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stdout.indexOf('=== unit1 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit2 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stdout.indexOf('=== unit3 =================================================' +
                                             '====================\n')).not.toBe(-1);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });
});
