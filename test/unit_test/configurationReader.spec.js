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
var rimraf = require('rimraf');

/**
 * @ignore
 * @suppress {duplicate}
 */
var ConfigurationNormalizer = require('../../src/ConfigurationNormalizer.js');

/**
 * @ignore
 * @suppress {duplicate}
 */
var configurationReader = require('../../src/configurationReader');

describe('config_reader', function () {
    beforeEach(function () {
        /**
         * @private
         * @const
         */
        this.EMPTY_CONFIG = {checkFs: {}, sources: [], externs: [], buildOptions: [],
                             warningsFilterFile: [], compilationUnits: {}, next: {}};
        this.resourcesToDelete = [];
    });

    beforeEach(function () {
        try {
            rimraf.sync('./.ccbuild');
        } catch (err) {
            // Either there is no data left, since it was deleted successfully in the try block or the data neve
            // existed and there is an ENOENT error thrown whcih can be ignored.
            expect(err.code).toBe('ENOENT');
        }
    });

    afterEach(function () {
        if (util.isArray(this.resourcesToDelete)) {
            this.resourcesToDelete.forEach(function (resource) {
                try {
                    rimraf.sync(resource);
                } catch (err) {
                    console.error(err);
                }
            });
        }
    });

    it('getLocalConfigFiles', function (done) {
        var configFilePaths = ['.ccbuild', 'ccbuild.ccbuild', 'config.ccbuild', 'config', 'ccbuild', 'conig.ccbuildx',
                               'conig.build'];
        var loadedConfigFilePaths = ['.ccbuild', 'ccbuild.ccbuild', 'config.ccbuild']
                .map(function (fileName) {
                    return path.resolve(fileName);
                });
        var testDirectory = 'test_data';
        var createConfigs = function (directoryPath) {
            var filePaths = configFilePaths;
            if (directoryPath) {
                directoryPath.split(path.sep).reduce(function (accumulator, currentDirectory) {
                    var nextDirectory = path.join(accumulator, currentDirectory);
                    if (!fs.existsSync(nextDirectory)) fs.mkdirSync(nextDirectory);
                    return nextDirectory;
                }, '');
                filePaths = filePaths.map(function (filePath) {
                    return path.join(directoryPath, filePath);
                });
            }
            filePaths.forEach(function (filePath) {
                fs.writeFileSync(filePath, '');
            });
        };
        createConfigs('.');
        createConfigs(testDirectory);

        configurationReader.getLocalConfigFiles().then(function (configFilePaths) {
            expect(configFilePaths.length).toBe(loadedConfigFilePaths.length);
            expect(configFilePaths).toEqual(jasmine.arrayContaining(loadedConfigFilePaths));
            done();
        }).catch(function (err) {
            done.fail(err);
        });
        Array.prototype.push.apply(this.resourcesToDelete, configFilePaths);
        Array.prototype.push.apply(this.resourcesToDelete, configFilePaths.map(function (filePath) {
            return path.join(testDirectory, filePath);
        }));
        this.resourcesToDelete.push(testDirectory);
    });

    it('merge warningsFilterFile inherit', function (done) {
        var testConfigPath = 'merge_waringsFilterFile.ccbuild';
        var config1 = {
            warningsFilterFile: path.join('test', 'filter.txt'),
            next: {
            }
        };
        config1.next[testConfigPath] = {
            inheritWarningsFilterFile: true
        };

        var cn = new ConfigurationNormalizer(config1);
        config1 = cn.normalize();

        var config2 = {
            warningsFilterFile: path.join('test', 'filter2.txt')
        };

        cn = new ConfigurationNormalizer(config2);
        config2 = cn.normalize();
        fs.writeFileSync(testConfigPath, JSON.stringify(config2, null, 2), 'utf8');

        configurationReader.readAndParseConfiguration(path.resolve(testConfigPath), config1)
            .then(function (mergedConfig) {
                expect(mergedConfig).toBeDefined();
                expect(mergedConfig.sources).toEqual([]);
                expect(mergedConfig.externs).toEqual([]);
                expect(mergedConfig.compilationUnits).toEqual({});
                expect(mergedConfig.next).toBeDefined();
                var nextPath = path.resolve(testConfigPath);
                expect(mergedConfig.next[nextPath]).toBeUndefined();
                expect(mergedConfig.buildOptions.length).toBe(0);
                expect(mergedConfig.warningsFilterFile).toBeDefined();
                expect(mergedConfig.warningsFilterFile.length).toBe(2);
                expect(mergedConfig.warningsFilterFile).toEqual(jasmine.arrayContaining([
                    path.join('test', 'filter.txt'), path.join('test', 'filter2.txt')]));
                done();
            }).catch(function (err) {
                done.fail(err);
            });
        this.resourcesToDelete.push(testConfigPath);
    });

    it('merge equal warningsFilterFile inherit', function (done) {
        var testConfigPath = 'merge_waringsFilterFile.ccbuild';
        var config1 = {
            warningsFilterFile: path.join('test', 'filter.txt'),
            next: {
            }
        };
        config1.next[testConfigPath] = {
            inheritWarningsFilterFile: true
        };

        var cn = new ConfigurationNormalizer(config1);
        config1 = cn.normalize();

        var config2 = {
            warningsFilterFile: path.join('test', 'filter.txt')
        };

        cn = new ConfigurationNormalizer(config2);
        config2 = cn.normalize();
        fs.writeFileSync(testConfigPath, JSON.stringify(config2, null, 2), 'utf8');

        configurationReader.readAndParseConfiguration(path.resolve(testConfigPath), config1)
            .then(function (mergedConfig) {
                expect(mergedConfig.warningsFilterFile.length).toBe(1);
                expect(mergedConfig.warningsFilterFile).toEqual(jasmine.arrayContaining([
                    path.join('test', 'filter.txt')]));
                done();
            }).catch(function (err) {
                done.fail(err);
            });
        this.resourcesToDelete.push(testConfigPath);
    });

    it('merge warningsFilterFile no-inherit', function (done) {
        var testConfigPath = 'merge_waringsFilterFile.ccbuild';
        var config1 = {
            warningsFilterFile: path.join('test', 'filter.txt'),
            next: {
            }
        };
        config1.next[testConfigPath] = {
            inheritWarningsFilterFile: false
        };

        var cn = new ConfigurationNormalizer(config1);
        config1 = cn.normalize();

        var config2 = {
            warningsFilterFile: path.join('test', 'filter2.txt')
        };

        cn = new ConfigurationNormalizer(config2);
        config2 = cn.normalize();
        fs.writeFileSync(testConfigPath, JSON.stringify(config2, null, 2), 'utf8');

        configurationReader.readAndParseConfiguration(path.resolve(testConfigPath), config1)
            .then(function (mergedConfig) {
                expect(mergedConfig.warningsFilterFile.length).toBe(1);
                expect(mergedConfig.warningsFilterFile).toEqual(jasmine.arrayContaining([
                    path.join('test', 'filter2.txt')]));
                done();
            }).catch(function (err) {
                done.fail(err);
            });
        this.resourcesToDelete.push(testConfigPath);
    });

    it('merge buildOptions inherit', function (done) {
        var testConfigPath = 'merge_buildOptions.ccbuild';
        var config1 = {
            buildOptions: [
                '--js=file1.js',
                '--js=file2.js',
                '--js', 'file3.js',
                '--externs=externs1.js',
                '--externs', 'externs1.js',
                '--externs=externs2.js',
                '--js=fil=e4.js=',
                '--version'
            ],
            next: {
            }
        };
        config1.next[testConfigPath] = {
            inheritBuildOptions: true
        };

        var cn = new ConfigurationNormalizer(config1);
        config1 = cn.normalize();

        var config2 = {
            buildOptions: [
                '--js=file3.js',
                '--js=file4.js',
                '--js', 'file5.js',
                '--debug',
                '--externs=externs2.js',
                '--externs', 'externs3.js',
                '--externs=externs4.js'
            ]
        };

        cn = new ConfigurationNormalizer(config2);
        config2 = cn.normalize();
        fs.writeFileSync(testConfigPath, JSON.stringify(config2, null, 2), 'utf8');

        configurationReader.readAndParseConfiguration(path.resolve(testConfigPath), config1)
            .then(function (mergedConfig) {
                expect(mergedConfig).toBeDefined();
                expect(mergedConfig.sources).toEqual([]);
                expect(mergedConfig.externs).toEqual([]);
                expect(mergedConfig.compilationUnits).toEqual({});
                expect(mergedConfig.next).toBeDefined();
                var nextPath = path.resolve(testConfigPath);
                expect(mergedConfig.next[nextPath]).toBeUndefined();
                var expectedBuildOptions = [
                    '--js', 'file1.js',
                    '--js', 'file2.js',
                    '--js', 'file3.js',
                    '--externs', 'externs1.js',
                    '--externs', 'externs1.js',
                    '--externs', 'externs2.js',
                    '--js', 'fil=e4.js=',
                    '--version',
                    '--js', 'file4.js',
                    '--js', 'file5.js',
                    '--debug',
                    '--externs', 'externs3.js',
                    '--externs', 'externs4.js'
                ];
                expect(mergedConfig.buildOptions.length).toBe(expectedBuildOptions.length);
                expect(mergedConfig.buildOptions).toEqual(jasmine.arrayContaining(expectedBuildOptions));
                done();
            }).catch(function (err) {
                done.fail(err);
            });
        this.resourcesToDelete.push(testConfigPath);
    });

    it('merge buildOptions no-inherit', function () {
        var testConfigPath = 'merge_buildOptions.ccbuild';
        var config1 = {
            buildOptions: [
                '--js=file1.js',
                '--js=file2.js',
                '--js', 'file3.js',
                '--externs=externs1.js',
                '--externs', 'externs1.js',
                '--externs=externs2.js',
                '--js=fil=e4.js=',
                '--version'
            ],
            next: {
            }
        };
        config1.next[testConfigPath] = {
            inheritBuildOptions: false
        };
        var cn = new ConfigurationNormalizer(config1);
        config1 = cn.normalize();

        var config2 = {
            buildOptions: [
                '--js=file3.js',
                '--js=file4.js',
                '--js', 'file5.js',
                '--debug',
                '--externs=externs2.js',
                '--externs', 'externs3.js',
                '--externs=externs4.js'
            ]
        };

        cn = new ConfigurationNormalizer(config2);
        config2 = cn.normalize();
        fs.writeFileSync(testConfigPath, JSON.stringify(config2, null, 2), 'utf8');

        configurationReader.readAndParseConfiguration(testConfigPath, config1).then(function (mergedConfig) {
            expect(mergedConfig).toBeDefined();
            expect(mergedConfig.sources).toEqual([]);
            expect(mergedConfig.externs).toEqual([]);
            expect(mergedConfig.compilationUnits).toEqual({});
            expect(mergedConfig.next).toBeDefined();
            var nextPath = path.resolve(testConfigPath);
            expect(mergedConfig.next[nextPath]).toBeUndefined();
            var expectedBuildOptions = [
                '--js', 'file3.js',
                '--js', 'file4.js',
                '--js', 'file5.js',
                '--debug',
                '--externs', 'externs2.js',
                '--externs', 'externs3.js',
                '--externs', 'externs4.js'
            ];
            expect(mergedConfig.buildOptions.length).toEqual(jasmine.arrayContains(expectedBuildOptions));
            done();
        }).catch(function (err) {
            done.fail(err);
        });
        this.resourcesToDelete.push(testConfigPath);
    });

    it('compilation units inherit', function (done) {
        var testConfigPath = 'merge_buildOptions.ccbuild';
        var config1 = {
            sources: [
                'file1.js',
                '/tmp/file2.js',
                './some/other/path/file2.js'
            ],
            externs: [
                'externs1.js',
                '/tmp/externs2.js',
                './some/other/path/externs2.js'
            ],
            buildOptions: [
                '--debug',
                '--language_in', 'ECMASCRIPT6_STRICT'
            ],
            compilationUnits: {
                unusedCompilationUnit: {
                    sources: [
                        'unit_file_1.js',
                        '/tmp/unit_file_2.js'
                    ],
                    externs: [
                        './some/path/unit_externs_1.js',
                        '/tmp/unit_externs_2.js'
                    ]
                }
            },
            next: {
            }
        };
        config1.next[testConfigPath] = {
            inheritSources: true,
            inheritExterns: true,
            inheritBuildOptions: true
        };
        var cn = new ConfigurationNormalizer(config1);
        config1 = cn.normalize();

        var config2 = {
            sources: [
                'file3.js',
                '/tmp/file2.js',
                './some/other/path/file4.js'
            ],
            externs: [
                'externs3.js',
                '/tmp/externs2.js',
                './some/other/path/externs2.js'
            ],
            buildOptions: [
                '--debug',
                '--language_out', 'ECMASCRIPT6_STRICT',
                '--version'
            ],
            compilationUnits: {
                compilationUnit1: {
                    sources: [
                        'unit1_file_1.js',
                        '/tmp/file2.js',
                        '/tmp/unit1_file_2.js'
                    ],
                    externs: [
                        './some/other/path/externs2.js',
                        '/tmp/unit1_externs_2.js'
                    ]
                },
                compilationUnit2: {
                    externs: [
                        './some/path/unit2_externs_9.js',
                        '/tmp/unit2_externs_2.js'
                    ],
                    buildOptions: [
                        '--debug',
                        '--language_out', 'ECMASCRIPT6_STRICT',
                        '--version',
                        '--transpile_only'
                    ]
                }
            }
        };

        cn = new ConfigurationNormalizer(config2);
        config2 = cn.normalize();

        fs.writeFileSync(testConfigPath, JSON.stringify(config2, null, 2), 'utf8');
        configurationReader.readAndParseConfiguration(path.resolve(testConfigPath), config1)
            .then(function (mergedConfig) {
                expect(mergedConfig).toBeDefined();
                expect(mergedConfig).toEqual(jasmine.any(Object));
                expect(mergedConfig.sources).toBeDefined();
                expect(mergedConfig.sources).toEqual(jasmine.any(Array));
                var expectedSources = [
                    path.join('file1.js'),
                    path.join('/', 'tmp', 'file2.js'),
                    path.join('some', 'other', 'path', 'file2.js'),
                    path.join('file3.js'),
                    path.join('some', 'other', 'path', 'file4.js')
                ];
                expect(mergedConfig.sources.length).toBe(expectedSources.length);
                expect(mergedConfig.sources).toEqual(jasmine.arrayContaining(expectedSources));
                expect(mergedConfig.externs).toBeDefined();
                expect(mergedConfig.externs).toEqual(jasmine.any(Array));
                var expectedExterns = [
                    path.join('externs1.js'),
                    path.join('/', 'tmp', 'externs2.js'),
                    path.join('some', 'other', 'path', 'externs2.js'),
                    path.join('externs3.js')
                ];
                expect(mergedConfig.externs.length).toBe(expectedExterns.length);
                expect(mergedConfig.externs).toEqual(jasmine.arrayContaining(expectedExterns));
                expect(mergedConfig.buildOptions).toBeDefined();
                expect(mergedConfig.buildOptions).toEqual(jasmine.any(Array));
                var expectedBuildOptions = [
                    '--debug',
                    '--language_in', 'ECMASCRIPT6_STRICT',
                    '--language_out', 'ECMASCRIPT6_STRICT',
                    '--version'
                ];
                expect(mergedConfig.buildOptions.length).toBe(expectedBuildOptions.length);
                expect(mergedConfig.buildOptions).toEqual(jasmine.arrayContaining(expectedBuildOptions));

                expect(mergedConfig.compilationUnits).toBeDefined();
                expect(mergedConfig.compilationUnits).toEqual(jasmine.any(Object));
                expect(Object.keys(mergedConfig.compilationUnits).length).toBe(2);

                expect(mergedConfig.compilationUnits.compilationUnit1).toBeDefined();
                expect(mergedConfig.compilationUnits.compilationUnit1.sources).toBeDefined();
                expect(mergedConfig.compilationUnits.compilationUnit1.sources).toEqual(jasmine.any(Array));
                var expectedUnitSources = [
                    path.join('unit1_file_1.js'),
                    path.join('/', 'tmp', 'unit1_file_2.js'),
                    path.join('/', 'tmp', 'file2.js')
                ];
                expect(mergedConfig.compilationUnits.compilationUnit1.sources.length).toBe(expectedUnitSources.length);
                expect(mergedConfig.compilationUnits.compilationUnit1.sources)
                    .toEqual(jasmine.arrayContaining(expectedUnitSources));

                expect(mergedConfig.compilationUnits.compilationUnit1.externs).toBeDefined();
                expect(mergedConfig.compilationUnits.compilationUnit1.externs).toEqual(jasmine.any(Array));
                var expectedUnitExterns = [
                    path.join('some', 'other', 'path', 'externs2.js'),
                    path.join('/', 'tmp', 'unit1_externs_2.js')
                ];
                expect(mergedConfig.compilationUnits.compilationUnit1.externs.length).toBe(expectedUnitExterns.length);
                expect(mergedConfig.compilationUnits.compilationUnit1.externs)
                    .toEqual(jasmine.arrayContaining(expectedUnitExterns));
                expect(mergedConfig.compilationUnits.compilationUnit1.buildOptions).toBeDefined();
                expect(mergedConfig.compilationUnits.compilationUnit1.buildOptions).toEqual(jasmine.any(Array));
                expect(mergedConfig.compilationUnits.compilationUnit1.buildOptions.length).toBe(0);

                expect(mergedConfig.compilationUnits.compilationUnit2).toBeDefined();
                expect(mergedConfig.compilationUnits.compilationUnit2.sources).toBeDefined();
                expect(mergedConfig.compilationUnits.compilationUnit2.sources).toEqual(jasmine.any(Array));
                expectedUnitSources = [];
                expect(mergedConfig.compilationUnits.compilationUnit2.sources.length).toBe(expectedUnitSources.length);
                expect(mergedConfig.compilationUnits.compilationUnit2.sources)
                    .toEqual(jasmine.arrayContaining(expectedUnitSources));

                expect(mergedConfig.compilationUnits.compilationUnit2.externs).toBeDefined();
                expect(mergedConfig.compilationUnits.compilationUnit2.externs).toEqual(jasmine.any(Array));
                expectedUnitExterns = [
                    path.join('some', 'path', 'unit2_externs_9.js'),
                    path.join('/', 'tmp', 'unit2_externs_2.js')
                ];
                expect(mergedConfig.compilationUnits.compilationUnit2.externs.length).toBe(expectedUnitExterns.length);
                expect(mergedConfig.compilationUnits.compilationUnit2.externs)
                    .toEqual(jasmine.arrayContaining(expectedUnitExterns));
                expect(mergedConfig.compilationUnits.compilationUnit2.buildOptions).toBeDefined();
                expect(mergedConfig.compilationUnits.compilationUnit2.buildOptions).toEqual(jasmine.any(Array));
                var expectedUnitBuildOptions = [
                    '--debug',
                    '--language_out', 'ECMASCRIPT6_STRICT',
                    '--version',
                    '--transpile_only'
                ];
                expect(mergedConfig.compilationUnits.compilationUnit2.buildOptions.length)
                    .toBe(expectedUnitBuildOptions.length);
                expect(mergedConfig.compilationUnits.compilationUnit2.buildOptions)
                    .toEqual(jasmine.arrayContaining(expectedUnitBuildOptions));

                expect(mergedConfig.next).toBeDefined();
                expect(mergedConfig.next).toEqual(jasmine.any(Object));
                expect(mergedConfig.next).toEqual({});
                done();
            }).catch(function (err) {
                done.fail(err);
            });
        this.resourcesToDelete.push(testConfigPath);
    });

    it('compilation units no-inherit', function (done) {
        var testConfigPath = 'merge_buildOptions.ccbuild';
        var config1 = {
            sources: [
                'file1.js',
                '/tmp/file2.js',
                './some/other/path/file2.js'
            ],
            externs: [
                'externs1.js',
                '/tmp/externs2.js',
                './some/other/path/externs2.js'
            ],
            buildOptions: [
                '--debug',
                '--language_in', 'ECMASCRIPT6_STRICT'
            ],
            compilationUnits: {
                unusedCompilationUnit: {
                    sources: [
                        'unit_file_1.js',
                        '/tmp/unit_file_2.js'
                    ],
                    externs: [
                        './some/path/unit_externs_1.js',
                        '/tmp/unit_externs_2.js'
                    ]
                }
            },
            next: {
            }
        };
        config1.next[testConfigPath] = {
            inheritSources: false,
            inheritExterns: false,
            inheritBuildOptions: false
        };
        var cn = new ConfigurationNormalizer(config1);
        config1 = cn.normalize();

        var config2 = {
            sources: [
                'file3.js',
                '/tmp/file2.js',
                './some/other/path/file4.js'
            ],
            externs: [
                'externs3.js',
                '/tmp/externs2.js',
                './some/other/path/externs2.js'
            ],
            buildOptions: [
                '--debug',
                '--language_out', 'ECMASCRIPT6_STRICT',
                '--version'
            ],
            compilationUnits: {
                compilationUnit1: {
                    sources: [
                        'unit1_file_1.js',
                        '/tmp/file2.js',
                        '/tmp/unit1_file_2.js'
                    ],
                    externs: [
                        './some/other/path/externs2.js',
                        '/tmp/unit1_externs_2.js'
                    ]
                },
                compilationUnit2: {
                    externs: [
                        './some/path/unit2_externs_9.js',
                        '/tmp/unit2_externs_2.js'
                    ],
                    buildOptions: [
                        '--debug',
                        '--language_out', 'ECMASCRIPT6_STRICT',
                        '--version',
                        '--transpile_only'
                    ]
                }
            }
        };

        cn = new ConfigurationNormalizer(config2);
        config2 = cn.normalize();

        fs.writeFileSync(testConfigPath, JSON.stringify(config2, null, 2), 'utf8');

        configurationReader.readAndParseConfiguration(testConfigPath, config1).then(function (mergedConfig) {
            expect(mergedConfig).toBeDefined();
            expect(mergedConfig).toEqual(jasmine.any(Object));
            expect(mergedConfig.sources).toBeDefined();
            expect(mergedConfig.sources).toEqual(jasmine.any(Array));
            var expectedSources = [
                path.join('/', 'tmp', 'file2.js'),
                path.join('file3.js'),
                path.join('some', 'other', 'path', 'file4.js')
            ];
            expect(mergedConfig.sources.length).toBe(expectedSources.length);
            expect(mergedConfig.sources).toEqual(jasmine.arrayContaining(expectedSources));
            expect(mergedConfig.externs).toBeDefined();
            expect(mergedConfig.externs).toEqual(jasmine.any(Array));
            var expectedExterns = [
                path.join('/', 'tmp', 'externs2.js'),
                path.join('some', 'other', 'path', 'externs2.js'),
                path.join('externs3.js')
            ];
            expect(mergedConfig.externs.length).toBe(expectedExterns.length);
            expect(mergedConfig.externs).toEqual(jasmine.arrayContaining(expectedExterns));
            expect(mergedConfig.buildOptions).toBeDefined();
            expect(mergedConfig.buildOptions).toEqual(jasmine.any(Array));
            var expectedBuildOptions = [
                '--debug',
                '--language_out', 'ECMASCRIPT6_STRICT',
                '--version'
            ];

            expect(mergedConfig.buildOptions.length).toBe(expectedBuildOptions.length);
            expect(mergedConfig.buildOptions).toEqual(jasmine.arrayContaining(expectedBuildOptions));

            expect(mergedConfig.compilationUnits).toBeDefined();
            expect(mergedConfig.compilationUnits).toEqual(jasmine.any(Object));
            expect(Object.keys(mergedConfig.compilationUnits).length).toBe(2);

            expect(mergedConfig.compilationUnits.compilationUnit1).toBeDefined();
            expect(mergedConfig.compilationUnits.compilationUnit1.sources).toBeDefined();
            expect(mergedConfig.compilationUnits.compilationUnit1.sources).toEqual(jasmine.any(Array));
            var expectedUnitSources = [
                path.join('unit1_file_1.js'),
                path.join('/', 'tmp', 'unit1_file_2.js'),
                path.join('/', 'tmp', 'file2.js')
            ];
            expect(mergedConfig.compilationUnits.compilationUnit1.sources.length).toBe(expectedUnitSources.length);
            expect(mergedConfig.compilationUnits.compilationUnit1.sources)
                .toEqual(jasmine.arrayContaining(expectedUnitSources));

            expect(mergedConfig.compilationUnits.compilationUnit1.externs).toBeDefined();
            expect(mergedConfig.compilationUnits.compilationUnit1.externs).toEqual(jasmine.any(Array));
            var expectedUnitExterns = [
                path.join('some', 'other', 'path', 'externs2.js'),
                path.join('/', 'tmp', 'unit1_externs_2.js')
            ];
            expect(mergedConfig.compilationUnits.compilationUnit1.externs.length).toBe(expectedUnitExterns.length);
            expect(mergedConfig.compilationUnits.compilationUnit1.externs)
                .toEqual(jasmine.arrayContaining(expectedUnitExterns));
            expect(mergedConfig.compilationUnits.compilationUnit1.buildOptions).toBeDefined();
            expect(mergedConfig.compilationUnits.compilationUnit1.buildOptions).toEqual(jasmine.any(Array));
            expect(mergedConfig.compilationUnits.compilationUnit1.buildOptions.length).toBe(0);

            expect(mergedConfig.compilationUnits.compilationUnit2).toBeDefined();
            expect(mergedConfig.compilationUnits.compilationUnit2.sources).toBeDefined();
            expect(mergedConfig.compilationUnits.compilationUnit2.sources).toEqual(jasmine.any(Array));
            expectedUnitSources = [];
            expect(mergedConfig.compilationUnits.compilationUnit2.sources.length).toBe(expectedUnitSources.length);
            expect(mergedConfig.compilationUnits.compilationUnit2.sources)
                .toEqual(jasmine.arrayContaining(expectedUnitSources));

            expect(mergedConfig.compilationUnits.compilationUnit2.externs).toBeDefined();
            expect(mergedConfig.compilationUnits.compilationUnit2.externs).toEqual(jasmine.any(Array));
            expectedUnitExterns = [
                path.join('some', 'path', 'unit2_externs_9.js'),
                path.join('/', 'tmp', 'unit2_externs_2.js')
            ];
            expect(mergedConfig.compilationUnits.compilationUnit2.externs.length).toBe(expectedUnitExterns.length);
            expect(mergedConfig.compilationUnits.compilationUnit2.externs)
                .toEqual(jasmine.arrayContaining(expectedUnitExterns));
            expect(mergedConfig.compilationUnits.compilationUnit2.buildOptions).toBeDefined();
            expect(mergedConfig.compilationUnits.compilationUnit2.buildOptions).toEqual(jasmine.any(Array));
            var expectedUnitBuildOptions = [
                '--debug',
                '--language_out', 'ECMASCRIPT6_STRICT',
                '--version',
                '--transpile_only'
            ];
            expect(mergedConfig.compilationUnits.compilationUnit2.buildOptions.length)
                .toBe(expectedUnitBuildOptions.length);
            expect(mergedConfig.compilationUnits.compilationUnit2.buildOptions)
                .toEqual(jasmine.arrayContaining(expectedUnitBuildOptions));

            expect(mergedConfig.next).toBeDefined();
            expect(mergedConfig.next).toEqual(jasmine.any(Object));
            expect(mergedConfig.next).toEqual({});
            done();
        }).catch(function (err) {
            done.fail(err);
        });
        this.resourcesToDelete.push(testConfigPath);
    });

    it('normalizes default checkFs', function () {
        var config = {
            checkFs: {}
        };
        var normalizer = new ConfigurationNormalizer(config);
        var normalizedConfig = normalizer.normalize();
        var expectedConfig = Object.assign({}, this.EMPTY_CONFIG);
        expectedConfig.checkFs = {check: [], ignore: [], fileExtensions: ['.js', '.json']};
        expect(normalizedConfig).toEqual(expectedConfig);
    });

    it('normalizes set checkFs.fileExtensions', function () {
        var config = {
            checkFs: {fileExtensions: ['.js', '', '.txt']}
        };
        var normalizer = new ConfigurationNormalizer(config);
        var normalizedConfig = normalizer.normalize();
        var expectedConfig = Object.assign({}, this.EMPTY_CONFIG);
        expectedConfig.checkFs = {check: [], ignore: [], fileExtensions: ['.js', '', '.txt']};
        expect(normalizedConfig).toEqual(expectedConfig);
    });

    it('normalizes set checkFs.check', function () {
        var config = {
            checkFs: {check: ['file1.js', '/tmp/files/file2.json', 'src/file3.js']}
        };
        var normalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = normalizer.normalize();
        var expectedConfig = Object.assign({}, this.EMPTY_CONFIG);
        expectedConfig.checkFs = {check: [path.join('test', 'unit_test', 'file1.js'),
                                          path.join('/', 'tmp', 'files', 'file2.json'),
                                          path.join('test', 'unit_test', 'src', 'file3.js')],
                                  ignore: [],
                                  fileExtensions: ['.js', '.json']};
        expect(normalizedConfig).toEqual(expectedConfig);
    });

    it('normalizes set checkFs.check', function () {
        var config = {
            checkFs: {check: ['file1.js', '/tmp/files/file2.json', 'src/file3.js']}
        };
        var normalizer = new ConfigurationNormalizer(config, __dirname, null, true);
        var normalizedConfig = normalizer.normalize();
        var expectedConfig = Object.assign({}, this.EMPTY_CONFIG);
        expectedConfig.checkFs = {check: [path.join(__dirname, 'file1.js'),
                                          path.join('/', 'tmp', 'files', 'file2.json'),
                                          path.join(__dirname, 'src/file3.js')],
                                  ignore: [],
                                  fileExtensions: ['.js', '.json']};
        expect(normalizedConfig).toEqual(expectedConfig);
    });

    it('normalizes set checkFs.ignore', function () {
        var config = {
            checkFs: {ignore: ['file1.js', '/tmp/files/file2.json', 'src/file3.js']}
        };
        var normalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = normalizer.normalize();
        var expectedConfig = Object.assign({}, this.EMPTY_CONFIG);
        expectedConfig.checkFs = {ignore: [path.join('test', 'unit_test', 'file1.js'),
                                           path.join('/', 'tmp', 'files', 'file2.json'),
                                           path.join('test', 'unit_test', 'src', 'file3.js')],
                                  check: [],
                                  fileExtensions: ['.js', '.json']};
        expect(normalizedConfig).toEqual(expectedConfig);
    });

    it('normalizes set checkFs.ignore', function () {
        var config = {
            checkFs: {ignore: ['file1.js', '/tmp/files/file2.json', 'src/file3.js']}
        };
        var normalizer = new ConfigurationNormalizer(config, __dirname, null, true);
        var normalizedConfig = normalizer.normalize();
        var expectedConfig = Object.assign({}, this.EMPTY_CONFIG);
        expectedConfig.checkFs = {ignore: [path.join(__dirname, 'file1.js'),
                                           path.join('/', 'tmp', 'files', 'file2.json'),
                                           path.join(__dirname, 'src/file3.js')],
                                  check: [],
                                  fileExtensions: ['.js', '.json']};
        expect(normalizedConfig).toEqual(expectedConfig);
    });
});
