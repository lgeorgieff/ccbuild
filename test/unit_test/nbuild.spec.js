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

describe('nbuild', function () {
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

        var configPath = path.join(__dirname, 'config1.nbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/nbuild.js --config ./test/unit_test/config1.nbuild',
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

        var configPath = path.join(__dirname, 'config1.nbuild');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ./src/nbuild.js --config ./test/unit_test/config1.nbuild',
                           function (err, stdout, stderr) {
                               if (!err) {
                                   done.fail(new Error('Expected that compilation process will fail!'));
                               } else {
                                   expect(err).toEqual(jasmine.any(Error));
                                   expect(stdout)
                                       .toBe('=== unit1 =============================================================' +
                                             '========\n');
                                   expect(stderr.length).toBeGreaterThan(0);
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
        var configPath1 = path.join(__dirname, 'config1.nbuild');
        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        var configPath2 = path.join(__dirname, 'config2.nbuild');
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        var configPath3 = path.join(__dirname, 'config3.nbuild');
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ../../src/nbuild.js', {cwd: __dirname},
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
        var configPath1 = path.join(__dirname, 'config1.nbuild');
        fs.writeFileSync(configPath1, JSON.stringify(config1, null, 2));
        var configPath2 = path.join(__dirname, 'config2');
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));
        var configPath3 = path.join(__dirname, 'config3');
        fs.writeFileSync(configPath3, JSON.stringify(config3, null, 2));
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        child_process.exec('node ../../src/nbuild.js -c ' + configPath2 + ' --config ' + configPath3, {cwd: __dirname},
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

    xit('compile with config hierarchy', function () {
        // use relative paths

        var config = {
            sources: [],
            externs: [],
            buildOptions: [],
            compilationUnits: {},
            next: {}
        };
    });

    xit('compilation errors', function () {});
});
