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

// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
/**
 * @ignore
 * @suppress {duplicate}
 */
var child_process = require('child_process');
// jscs:enable requireCamelCaseOrUpperCaseIdentifiers

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

describe('bin', function () {
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

    it('compile with single config -- success', function (done) {
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --ignore-warnings --config ' +
                           './test/system_test/config1.ccbuild',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --ignore-errors --config ' +
                           './test/system_test/config1.ccbuild',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --ignore-errors --config ' +
                           './test/system_test/config1.ccbuild',
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
        child_process.exec('node ../../src/bin.js --disable-caching', {cwd: __dirname},
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
        child_process.exec('node ../../src/bin.js --disable-caching -c ' + configPath2 + ' --config ' + configPath3,
                           {cwd: __dirname},
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
        this.resourcesToDelete.push(configPath1, configPath2, configPath3);
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
            buildOptions: ['--flagfile', './test/system_test/data/test_flagfile'],
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
        child_process.exec('node ./src/bin.js --disable-caching -c ' + configPath1,
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
            buildOptions: ['--flagfile', './test/system_test/data/test_flagfile'],
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
        child_process.exec('node ./src/bin.js --disable-caching -c ' + configPath1,
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
        this.resourcesToDelete.push(configPath1, configPath2, configPath3);
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching -c ' + configPath1,
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching -c ' + configPath1,
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                }
            },
            next: {}
        };
        config3.next[configPath3] = {};

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching -c ' + configPath1,
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild ' +
                           '--ignore-compiled-code',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild ' +
                           '--ignore-compiled-code',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild ' +
                           '--ignore-compiled-code --ignore-warnings',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild ' +
                           '--ignore-compiled-code',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild ' +
                           '--ignore-compiled-code',
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
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild ' +
                           '--stop-on-error',
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

    it('compile with outputFile option -- success', function (done) {
        var out1 = path.join('test', 'system_test', 'out1.js');
        var out2 = path.join('test', 'system_test', 'out2.js');
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './test/system_test/data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                    outputFile: path.basename(out1)
                },
                unit3: {
                    outputFile: path.basename(out2),
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --config ' + configPath,
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   let hd1 = '=== unit1 =============================================================' +
                                           '========';
                                   let hd3 = '=== unit3 =============================================================' +
                                           '========';
                                   expect(stdout.indexOf(hd1)).not.toBe(-1);
                                   expect(stdout.indexOf(hd3)).not.toBe(-1);
                                   expect(stdout.length).toBe(hd1.length + hd3.length + '\n\n\n\n\n\n'.length);
                                   expect(stderr.length).toBe(0);
                                   expect(fs.statSync(out1).size).toBeGreaterThan(0);
                                   expect(fs.statSync(out2).size).toBeGreaterThan(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath, out1, out2);
    });

    it('compile with outputFile option and --ignore-compiled-code flag -- success', function (done) {
        var self = this;
        var out1 = path.join('test', 'system_test', 'out1.js');
        var out2 = path.join('test', 'system_test', 'out2.js');
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './test/system_test/data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                    outputFile: path.basename(out1)
                },
                unit3: {
                    outputFile: path.basename(out2),
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --ignore-compiled-code --config ' +
                           './test/system_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stdout.length).toBe(0);
                                   expect(stderr.length).toBe(0);
                                   try {
                                       expect(fs.statSync(out1).size).toBeGreaterThan(0);
                                       expect(fs.statSync(out2).size).toBeGreaterThan(0);
                                   } catch (fsErr) {
                                       fail(fsErr);
                                   }
                                   self.resourcesToDelete.push(configPath, out1, out2);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    });

    it('compile with outputFile option and config hierachy -- warning', function (done) {
        var self = this;
        var out1 = path.join('test', 'system_test', 'out1.js');
        var out2 = path.join('test', 'system_test', 'data', 'out2.js');
        var out3 = path.join('test', 'system_test', 'data', 'configs', 'out3.js');
        var out4 = path.join('test', 'system_test', 'data', 'configs', 'out4.js');

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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile'],
                    outputFile: path.basename(out1)
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile'],
                    outputFile: path.basename(out2)
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile'],
                    outputFile: path.basename(out3)
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile'],
                    outputFile: path.basename(out4)
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   var hd1 = '=== unit1 =============================================================' +
                                           '========';
                                   var hd2 = '=== unit2 =============================================================' +
                                           '========';
                                   var hd3 = '=== unit3 =============================================================' +
                                           '========';
                                   var hd4 = '=== unit4 =============================================================' +
                                           '========';
                                   expect(stdout.indexOf(hd1)).not.toBe(-1);
                                   expect(stdout.indexOf(hd2)).not.toBe(-1);
                                   expect(stdout.indexOf(hd3)).not.toBe(-1);
                                   expect(stdout.indexOf(hd4)).not.toBe(-1);
                                   expect(stdout.length).toBe(hd1.length + hd2.length + hd3.length + hd4.length +
                                                              '\n\n\n\n\n\n\n\n\n\n\n\n'.length);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   try {
                                       expect(fs.statSync(out1).size).toBeGreaterThan(0);
                                       expect(fs.statSync(out2).size).toBeGreaterThan(0);
                                       expect(fs.statSync(out3).size).toBeGreaterThan(0);
                                       expect(fs.statSync(out4).size).toBeGreaterThan(0);
                                   } catch (err) {
                                       done.fail(err);
                                   }
                                   self.resourcesToDelete.push(configPath1, configPath2, configPath3, out1, out2, out3,
                                                               out4, temporaryConfigDirectory);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    });

    it('compile with outputFile option -- error', function (done) {
        var out1 = path.join('test', 'system_test', 'out1.js');
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './test/system_test/data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                    outputFile: path.basename(out1),
                    sources: ['./data/source3.js', './data/source4.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (err) {
                                   let hd1 = '=== unit1 =============================================================' +
                                           '========';
                                   expect(stderr.indexOf(hd1)).not.toBe(-1);
                                   expect(stdout.length).toBe(0);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   try {
                                       expect(fs.statSync(out1).size).toBeGreaterThan(0);
                                       done.fail('Expected ' + out1 + ' not to be existing!');
                                   } catch (fsErr) {
                                       if (fsErr.code === 'ENOENT') done();
                                       else done.fail(fsErr);
                                   }
                               } else {
                                   done.fail('Expeted compilation process to fail!');
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compiles only units that are filtered by the -u and the --unit option', function (done) {
        var self = this;
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching -c ' + configPath1 + ' -u unit1 --unit unit4 ' +
                           '--unit unit3',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   var hd1 = '=== unit1 =============================================================' +
                                           '========';
                                   var hd2 = '=== unit2 =============================================================' +
                                           '========';
                                   var hd3 = '=== unit3 =============================================================' +
                                           '========';
                                   var hd4 = '=== unit4 =============================================================' +
                                           '========';
                                   expect(stdout.indexOf(hd1)).not.toBe(-1);
                                   expect(stdout.indexOf(hd2)).toBe(-1);
                                   expect(stdout.indexOf(hd3)).not.toBe(-1);
                                   expect(stdout.indexOf(hd4)).not.toBe(-1);
                                   expect(stdout.length).toBeGreaterThan(0);
                                   expect(stderr.length).toBe(0);
                                   self.resourcesToDelete.push(configPath1, configPath2, configPath3,
                                                               temporaryConfigDirectory);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    });

    it('wrong unit name in in the -u and the --unit option has no effect', function (done) {
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './test/system_test/data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                    sources: ['./data/source3.js', './data/source4.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (err) {
                                   let hd1 = '=== unit1 =============================================================' +
                                           '========';
                                   expect(stderr.indexOf(hd1)).not.toBe(-1);
                                   expect(stdout.length).toBe(0);
                                   expect(stderr.length).toBeGreaterThan(0);
                                   done();
                               } else {
                                   done.fail('Expeted compilation process to fail!');
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('checkFs inside config hierarchy -- success', function (done) {
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
            checkFs: {
                check: ['data/source1.js'],
                ignore: ['externs*.js']
            },
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM'
            ],
            compilationUnits: {
                unit1: {
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
            checkFs: {
                check: ['.'],
                ignore: ['externs*.js', 'source3.js', 'source4.js', 'source5.js']
            },
            compilationUnits: {
                unit2: {
                    sources: ['source2.js'],
                    externs: ['./externs2.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
            checkFs: {
                check: ['./configs/*'],
                ignore: ['externs*.js']
            },
            compilationUnits: {
                unit3: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --ignore-compiled-code -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('checkFs inside config hierarchy -- verificationError', function (done) {
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
            checkFs: {
                check: ['data/source1.js'],
                ignore: ['externs*.js']
            },
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM'
            ],
            compilationUnits: {
                unit1: {
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
            checkFs: {
                check: ['.'],
                ignore: ['externs*.js']
            },
            compilationUnits: {
                unit2: {
                    sources: ['source2.js'],
                    externs: ['./externs2.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
            checkFs: {
                check: ['./configs/*'],
                ignore: ['externs*.js']
            },
            compilationUnits: {
                unit3: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --ignore-compiled-code -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (err) {
                                   expect(stderr.indexOf('source3.js')).not.toBe(-1);
                                   expect(stderr.indexOf('source4.js')).not.toBe(-1);
                                   done();
                               } else {
                                   fail('Expected the ccbuild to fail!');
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('checkFs inside config hierarchy -- verificationError & --ignore-errors & --ignore-warnings', function (done) {
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
            checkFs: {
                check: ['data/source1.js'],
                ignore: ['externs*.js']
            },
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM'
            ],
            compilationUnits: {
                unit1: {
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
            checkFs: {
                check: ['.'],
                ignore: ['externs*.js']
            },
            compilationUnits: {
                unit2: {
                    sources: ['source2.js'],
                    externs: ['./externs2.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
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
            checkFs: {
                check: ['./configs/*'],
                ignore: ['externs*.js']
            },
            compilationUnits: {
                unit3: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                },
                unit4: {
                    sources: ['../source3.js', '../source4.js'],
                    externs: ['../externs2.js', '../externs3.js'],
                    buildOptions: ['--flagfile', './test/system_test/data/test_flagfile']
                }
            }
        };

        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));

        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --ignore-compiled-code --ignore-warnings ' +
                           '--ignore-errors -c ' + configPath1,
                           function (err, stdout, stderr) {
                               if (err) {
                                   expect(stderr.length).toBe(0);
                                   done();
                               } else {
                                   fail('Expected the ccbuild to fail!');
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath1);
        this.resourcesToDelete.push(configPath2);
        this.resourcesToDelete.push(configPath3);
        this.resourcesToDelete.push(temporaryConfigDirectory);
    });

    it('checkFs -- --ignore-check-fs', function (done) {
        var config = {
            checkFs: {
                check: ['data/*']
            },
            compilationUnits: {}
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --ignore-check-fs --config ' +
                           './test/system_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   expect(stderr.length).toBe(0);
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('checkFs -- --stop-on-error', function (done) {
        var config = {
            checkFs: {
                check: ['data/*']
            },
            compilationUnits: {}
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --stop-on-error --config ' +
                           './test/system_test/config1.ccbuild',
                           function (err, stdout, stderr) {
                               if (err) {
                                   var filesToCheck = ['externs1.js', 'externs2.js', 'externs3.js', 'source1.js',
                                                       'source2.js', 'source3.js', 'source4.js'];
                                   var filesInErrorMessage = filesToCheck.filter(function (file) {
                                       return stderr.indexOf(file) !== -1;
                                   });
                                   expect(filesInErrorMessage.length).toBe(1);
                                   done();
                               } else {
                                   fail('Expected the ccbuild to fail!');
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with --stop-on-warning - with warning', function (done) {
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './test/system_test/data/test_flagfile'
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
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild ' +
                           '--stop-on-warning',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done();
                               } else {
                                   done.fail('Expected ccbuild to exit with error code 1');
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    it('compile with --stop-on-warning - without warning', function (done) {
        var config = {
            sources: ['./data/source1.js'],
            externs: ['data/externs1.js'],
            buildOptions: [
                '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
                '--warning_level', 'VERBOSE',
                '--env', 'CUSTOM',
                '--flagfile', './test/system_test/data/test_flagfile'
            ],
            compilationUnits: {
                unit1: {
                    sources: ['./data/source3.js', './data/source4.js'],
                    externs: ['./data/externs2.js', 'data/externs3.js']
                }
            }
        };

        var configPath = path.join(__dirname, 'config1.ccbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/bin.js --disable-caching --config ./test/system_test/config1.ccbuild ' +
                           '--stop-on-warning',
                           function (err, stdout, stderr) {
                               if (err) {
                                   done.fail(err);
                               } else {
                                   done();
                               }
                           });
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
        this.resourcesToDelete.push(configPath);
    });

    describe('with caching enabled', function () {
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
        var configPath2 = path.join(__dirname, 'config2');
        var configPath3 = path.join(__dirname, 'config3');

        beforeEach(function () {
            fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
            fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
            fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));
        });

        it('compile with config and default config', function (done) {
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            try {
                fs.readdirSync(path.join(__dirname, './.ccbuild'))
                    .forEach(function (fileName) {
                        fs.unlinkSync(path.join(__dirname, './.ccbuild', fileName));
                    });
                fs.rmdirSync(path.join(__dirname, './.ccbuild'));
            } catch (err) {
                expect(err).toBeNull();
            }
            var test = function (cbOk, cbFail) {
                child_process.exec('node ../../src/bin.js -c ' + configPath2 + ' --config ' + configPath3,
                                   {cwd: __dirname},
                                   function (err, stdout, stderr) {
                                       if (err) {
                                           cbFail(err);
                                       } else {
                                           expect(stdout.length).toBeGreaterThan(0);
                                           expect(stdout.indexOf('=== unit1 =================================================' +
                                                                 '====================\n')).toBe(-1);
                                           expect(stdout.indexOf('=== unit2 =================================================' +
                                                                 '====================\n')).not.toBe(-1);
                                           expect(stdout.indexOf('=== unit3 =================================================' +
                                                                 '====================\n')).not.toBe(-1);
                                           expect(stderr.length).toBeGreaterThan(0);
                                           expect(fs.statSync(path.join(__dirname, './.ccbuild')).isDirectory()).toBeTruthy();
                                           var files = fs.readdirSync(path.join(__dirname, './.ccbuild'));
                                           expect(files.length).toBe(3);
                                           expect(files).toEqual(jasmine.arrayContaining(
                                               ['bibliography.json']));
                                           cbOk();
                                       }
                                   });
            };
            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            test(function () {
                test(done, done.fail);
            }, done.fail);
            
            this.resourcesToDelete.push(configPath1, configPath2, configPath3);
        });
    });
});
