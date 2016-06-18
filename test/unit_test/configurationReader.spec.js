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
                             compilationUnits: {}, next: {}};
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

    xit('getLocalConfigFiles', function (done) {
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

    it('get compiler arguments', function () {
        var sources1 = [
            path.resolve('file1.js'),
            path.resolve('/tmp/file2.js'),
            path.resolve('./some/other/path/file2.js')
        ];
        var externs1 = [
            path.resolve('externs1.js'),
            path.resolve('/tmp/externs2.js'),
            path.resolve('./some/other/path/externs2.js')
        ];
        var buildOptions1 = [
            '--debug',
            '--language_in', 'ECMASCRIPT6_STRICT'
        ];
        var sources2 = [
            path.resolve('file3.js'),
            path.resolve('/tmp/file2.js'),
            path.resolve('./some/other/path/file4.js'),
            path.resolve('file1.js'),
            path.resolve('./some/other/path/file2.js')
        ];
        var externs2 = [
            path.resolve('externs3.js'),
            path.resolve('/tmp/externs2.js'),
            path.resolve('./some/other/path/externs2.js'),
            path.resolve('externs1.js')
        ];
        var buildOptions2 = [
            '--debug',
            '--language_out', 'ECMASCRIPT6_STRICT',
            '--version'
        ];
        var compilationUnit1 = {
            sources: [
                path.resolve('unit_file1.js'),
                path.resolve('/tmp/unit_file2.js')
            ],
            externs: [
                path.resolve('./some/path/unit_externs1.js'),
                path.resolve('/tmp/unit_externs2.js')
            ]
        };
        var compilationUnit2 = {
            sources: [
                path.resolve('unit1_file1.js'),
                path.resolve('/tmp/file2.js'),
                path.resolve('/tmp/unit1_file2.js')
            ],
            externs: [
                path.resolve('./some/other/path/externs2.js'),
                path.resolve('/tmp/unit1_externs2.js'),
                path.resolve('externs3.js')
            ]
        };
        var compilationUnit3 = {
            externs: [
                path.resolve('./some/path/unit2_externs9.js'),
                path.resolve('/tmp/unit2_externs2.js'),
                path.resolve('file1.js')
            ],
            buildOptions: [
                '--debug',
                '--language_out', 'ECMASCRIPT6_STRICT',
                '--version',
                '--transpile_only'
            ]
        };

        var unitConfiguration1 = {
            globalSources: sources1,
            unitSources: compilationUnit1.sources,
            globalExterns: externs1,
            unitExterns: compilationUnit1.externs,
            globalBuildOptions: buildOptions1,
            unitBuildOptions: []
        };

        var compilerArguments = configurationReader.getCompilerArguments(unitConfiguration1);
        var expectedCompilerArguments = [
            '--js', path.resolve('file1.js'),
            '--js', path.resolve('/tmp/file2.js'),
            '--js', path.resolve('./some/other/path/file2.js'),
            '--externs', path.resolve('externs1.js'),
            '--externs', path.resolve('/tmp/externs2.js'),
            '--externs', path.resolve('./some/other/path/externs2.js'),
            '--debug',
            '--language_in', 'ECMASCRIPT6_STRICT',
            '--js', path.resolve('unit_file1.js'),
            '--js', path.resolve('/tmp/unit_file2.js'),
            '--externs', path.resolve('./some/path/unit_externs1.js'),
            '--externs', path.resolve('/tmp/unit_externs2.js')
        ];
        expect(compilerArguments).toEqual(jasmine.any(Array));
        expect(compilerArguments.length).toBe(expectedCompilerArguments.length);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(expectedCompilerArguments));
        var checkArgumentBefore = function (argumentArray, argument, argumentBefore) {
            var indexArgument = argumentArray.indexOf(argument);
            expect(indexArgument).toBeGreaterThan(0);
            expect(argumentArray[indexArgument - 1]).toEqual(argumentBefore);
        };
        checkArgumentBefore(compilerArguments, path.resolve('file1.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('/tmp/file2.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('./some/other/path/file2.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('unit_file1.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('/tmp/unit_file2.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('externs1.js'), '--externs');
        checkArgumentBefore(compilerArguments, path.resolve('/tmp/externs2.js'), '--externs');
        checkArgumentBefore(compilerArguments, path.resolve('./some/other/path/externs2.js'), '--externs');
        checkArgumentBefore(compilerArguments, path.resolve('./some/path/unit_externs1.js'), '--externs');
        checkArgumentBefore(compilerArguments, path.resolve('/tmp/unit_externs2.js'), '--externs');
        checkArgumentBefore(compilerArguments, 'ECMASCRIPT6_STRICT', '--language_in');

        var unitConfiguration2 = {
            globalSources: sources2,
            unitSources: compilationUnit2.sources,
            globalExterns: externs2,
            unitExterns: compilationUnit2.externs,
            globalBuildOptions: buildOptions2,
            unitBuildOptions: []
        };
        compilerArguments = configurationReader.getCompilerArguments (unitConfiguration2);
        expectedCompilerArguments = [
            '--js', path.resolve('file3.js'),
            '--js', path.resolve('/tmp/file2.js'),
            '--js', path.resolve('./some/other/path/file4.js'),
            '--js', path.resolve('file1.js'),
            '--js', path.resolve('./some/other/path/file2.js'),
            '--externs', path.resolve('externs3.js'),
            '--externs', path.resolve('/tmp/externs2.js'),
            '--externs', path.resolve('./some/other/path/externs2.js'),
            '--externs', path.resolve('externs1.js'),
            '--debug',
            '--language_out', 'ECMASCRIPT6_STRICT',
            '--version',
            '--js', path.resolve('unit1_file1.js'),
            '--js', path.resolve('/tmp/unit1_file2.js'),
            '--externs', path.resolve('/tmp/unit1_externs2.js')
        ];
        expect(compilerArguments).toEqual(jasmine.any(Array));
        expect(compilerArguments.length).toBe(expectedCompilerArguments.length);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(expectedCompilerArguments));
        checkArgumentBefore(compilerArguments, path.resolve('file3.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('/tmp/file2.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('./some/other/path/file4.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('file1.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('./some/other/path/file2.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('unit1_file1.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('/tmp/unit1_file2.js'), '--js');
        checkArgumentBefore(compilerArguments, path.resolve('externs3.js'), '--externs');
        checkArgumentBefore(compilerArguments, path.resolve('/tmp/externs2.js'), '--externs');
        checkArgumentBefore(compilerArguments, path.resolve('./some/other/path/externs2.js'), '--externs');
        checkArgumentBefore(compilerArguments, path.resolve('externs1.js'), '--externs');
        checkArgumentBefore(compilerArguments, path.resolve('/tmp/unit1_externs2.js'), '--externs');
        checkArgumentBefore(compilerArguments, 'ECMASCRIPT6_STRICT', '--language_out');

        var unitConfiguration3 = {
            globalSources: sources2,
            unitSources: [],
            globalExterns: externs2,
            unitExterns: compilationUnit3.externs,
            globalBuildOptions: buildOptions2,
            unitBuildOptions: compilationUnit3.buildOptions
        };
        compilerArguments = configurationReader.getCompilerArguments (unitConfiguration3);
        expectedCompilerArguments = [
            '--js', path.resolve('file3.js'),
            '--js', path.resolve('/tmp/file2.js'),
            '--js', path.resolve('./some/other/path/file4.js'),
            '--js', path.resolve('file1.js'),
            '--js', path.resolve('./some/other/path/file2.js'),
            '--externs', path.resolve('externs3.js'),
            '--externs', path.resolve('/tmp/externs2.js'),
            '--externs', path.resolve('./some/other/path/externs2.js'),
            '--externs', path.resolve('externs1.js'),
            '--debug',
            '--language_out', 'ECMASCRIPT6_STRICT',
            '--version',
            '--externs', path.resolve('./some/path/unit2_externs9.js'),
            '--externs', path.resolve('/tmp/unit2_externs2.js'),
            '--externs', path.resolve('file1.js'),
            '--transpile_only'
        ];
        expect(compilerArguments).toEqual(jasmine.any(Array));
        expect(compilerArguments.length).toBe(expectedCompilerArguments.length);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(expectedCompilerArguments));
    });

    it('processes empty config for unit properly', function () {
        expect(configurationReader.getCompilerArguments ({})).toEqual([]);
    });

    it('processes outputFile config properly', function () {
        var unitConfiguration1 = {
            unitExterns: ['externs1.js'],
            unitSources: ['sources1.js'],
            outputFile: 'out.js'
        };
        var compilerArguments = configurationReader.getCompilerArguments (unitConfiguration1);
        expect(compilerArguments.length).toBe(6);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(['--js', 'sources1.js', '--externs', 'externs1.js',
                                                                   '--js_output_file', 'out.js']));
    });

    it('takes into account --js option in buildOptions', () => {
        var unitConfiguration1 = {
            unitBuildOptions: ['--js', 'source2.js'],
            unitSources: ['source1.js']
        };
        var compilerArguments = configurationReader.getCompilerArguments (unitConfiguration1);
        expect(compilerArguments.length).toBe(4);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(['--js', 'source1.js',
                                                                   '--js', 'source2.js']));
    });

    it('takes into account --js option in global buildOptions', () => {
        var unitConfiguration1 = {
            globalBuildOptions: ['--js', 'source2.js'],
            unitSources: ['source1.js']
        };
        var compilerArguments = configurationReader.getCompilerArguments(unitConfiguration1);
        expect(compilerArguments.length).toBe(4);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(['--js', 'source1.js',
                                                                   '--js', 'source2.js']));
    });

    it('takes into account --externs option in buildOptions', () => {
        var unitConfiguration1 = {
            unitBuildOptions: ['--externs', 'externs2.js'],
            unitExterns: ['externs1.js']
        };
        var compilerArguments = configurationReader.getCompilerArguments(unitConfiguration1);
        expect(compilerArguments.length).toBe(4);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(['--externs', 'externs1.js',
                                                                   '--externs', 'externs2.js']));
    });

    it('takes into account --externs option in global buildOptions', () => {
        var unitConfiguration1 = {
            globalBuildOptions: ['--externs', 'externs2.js'],
            unitExterns: ['externs1.js']
        };
        var compilerArguments = configurationReader.getCompilerArguments(unitConfiguration1);
        expect(compilerArguments.length).toBe(4);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(['--externs', 'externs1.js',
                                                                   '--externs', 'externs2.js']));
    });

    it('takes into account --js_output_file option in buildOptions', () => {
        var unitConfiguration1 = {
            unitBuildOptions: ['--js_output_file', 'out.js'],
            unitExterns: ['externs1.js']
        };
        var compilerArguments = configurationReader.getCompilerArguments(unitConfiguration1);
        expect(compilerArguments.length).toBe(4);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(['--externs', 'externs1.js',
                                                                   '--js_output_file', 'out.js']));
    });

    it('takes into account --js_output_file option in global buildOptions', () => {
        var unitConfiguration1 = {
            globalBuildOptions: ['--js_output_file', 'out.js'],
            unitExterns: ['externs1.js']
        };
        var compilerArguments = configurationReader.getCompilerArguments(unitConfiguration1);
        expect(compilerArguments.length).toBe(4);
        expect(compilerArguments).toEqual(jasmine.arrayContaining(['--externs', 'externs1.js',
                                                                   '--js_output_file', 'out.js']));
    });

    it('throws in case of outputFile config and --js_output_file build option', function () {
        var unitConfiguration1 = {
            unitBuildOptions: ['--js_output_file', 'out.js'],
            outputFile: 'anotherOutputFile.js',
            unitExterns: ['externs1.js']
        };
        expect(function () {
            configurationReader.getCompilerArguments(unitConfiguration1);
        }).toThrowError();
    });

    it('throws in case of outputFile config and --js_output_file global build option', function () {
        var unitConfiguration1 = {
            globalBuildOptions: ['--js_output_file', 'out.js'],
            outputFile: 'anotherOutputFile.js',
            unitExterns: ['externs1.js']
        };
        expect(function () {
            configurationReader.getCompilerArguments(unitConfiguration1);
        }).toThrowError();
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
