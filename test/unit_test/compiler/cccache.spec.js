'use strict';

/**
 * @ignore
 * @suppress {dupicate}
 */
var path = require('path');

/**
 * @ignore
 * @suppress {dupicate}
 */
var fs = require('fs');

/**
 * @ignore
 * @suppress {dupicate}
 */
var mockFs = require('mock-fs');

/**
 * @ignore
 * @suppress {dupicate}
 */
var CCCache = require('../../../src/compiler/CCCache.js');

fdescribe('Class CCCache', function () {
    beforeEach(function () {
        mockFs({
            '/tmp': {
            }
        });
    });

    afterEach(function () {
        mockFs.restore();
    });

    describe('cannot be instantiated if', function () {
        it('cacheFolder option is not given', function () {
            expect(function () {
                new CCCache();
            }).toThrowError();

            expect(function () {
                new CCCache(null);
            }).toThrowError();
        });

        it('cacheFolder option is of wrong type', function () {
            expect(function () {
                new CCCache(123);
            }).toThrowError();
        });

        it('cacheFolder option is an empty string', function () {
            expect(function () {
                new CCCache('');
            }).toThrowError();
        });

        it('cacheFolder option is whitespace-only string', function () {
            expect(function () {
                new CCCache('  \t\t  \r  \n\n  \n');
            }).toThrowError();
        });
    });

    describe('can be instantiated if', function () {
        it('cacheFolder is set properly', function () {
            var cccache;

            expect(function () {
                cccache = new CCCache('/tmp');
            }).not.toThrow();

            expect(cccache).not.toBeNull();
            expect(cccache).toBeDefined();
            expect(cccache).toEqual(jasmine.any(CCCache));
        });
    });

    describe('.ctor()', function () {
        it('returns a new instance for a new cache folder location', function () {
            var cache1 = new CCCache('/tmp/cache1');
            var cache2 = new CCCache('/tmp/cache2');

            expect(cache1).toBeDefined();
            expect(cache1).not.toBeNull();
            expect(cache1).toEqual(jasmine.any(CCCache));
            expect(cache2).toBeDefined();
            expect(cache2).not.toBeNull();
            expect(cache2).toEqual(jasmine.any(CCCache));
            expect(cache1).not.toBe(cache2);
        });

        it('returns an already existing instance for a known cache folder location', function () {
            var cache30 = new CCCache('/tmp/cache3');
            var cache31 = new CCCache('/tmp/cache3');
            expect(cache30).toBeDefined();
            expect(cache30).not.toBeNull();
            expect(cache30).toBe(cache31);
        });

        it('returns an already existing instance for a known cache folder location with different syntax', function () {
            var cache40 = new CCCache('/tmp/cache4');
            var cache41 = new CCCache('/tmp/../tmp///cache4');
            expect(cache40).toBeDefined();
            expect(cache40).not.toBeNull();
            expect(cache40).toBe(cache41);
        });
    });

    describe('.persist()', function () {
        it('writes changes to index file', function () {
        });
    });

    describe('.write()', function () {
        beforeEach(function () {
            mockFs({
                '/tmp/write/cache1': {
                },
                '/tmp/write/cache2': {
                },
                '/tmp/write/cache3': {
                },
                '/tmp/write/cache4': {
                },
                '/data': {
                    'globalSource1.js': 'console.log(\'global source 1\');',
                    'globalSource2.js': 'console.log(\'global source 2\');',
                    'unitSource1.js': 'console.log(\'unit source 1\');',
                    'unitSource2.js': 'console.log(\'unit source 2\');',
                    'globalExterns1.js': 'var globalExterns1;',
                    'globalExterns2.js': 'var globalExterns2;',
                    'unitExterns1.js': 'var unitExterns1;',
                    'unitExterns2.js': 'var unitExterns2;',
                    'globalWarningsFilterFile1.txt': 'global warnings filter file 1',
                    'globalWarningsFilterFile2.txt': 'global warnings filter file 2',
                    'unitWarningsFilterFile1.txt': 'unit warnings filter file 1',
                    'unitWarningsFilterFile2.txt': 'unit warnings filter file 2'
                }
            });
        });

        afterEach(function () {
            mockFs.restore();
        });

        var compilerConfiguration1 = {
            workingDirectory: '.',
            unitName: 'unit1',
            globalSources: ['/data/globalSource1.js', '/data/globalSource2.js'],
            unitSources: ['/data/unitSource1.js', '/data/unitSource2.js'],
            globalExterns: ['/data/globalExterns1.js', '/data/globalExterns2.js'],
            unitExterns: ['/data/unitExterns1.js', '/data/unitExterns2.js'],
            globalBuildOptions: ['globalOption1', 'globalOption2'],
            unitBuildOptions: ['unitOption1', 'unitOption2'],
            outputFile: null,
            globalWarningsFilterFile: ['/data/globalWarningsFilterFile1.txt',
                                       '/data/globalWarningsFilterFile2.txt'],
            unitWarningsFilterFile: ['/data/unitWarningsFilterFile1.txt', '/data/unitWarningsFilterFile2.txt']
        };
        var compilationResult1 = {stdout: 'console.log(\'Hello World!\')'};
        var compilerConfiguration2 = {
            workingDirectory: '.',
            unitName: 'unit1',
            globalSources: ['/data/globalSource1.js'],
            unitSources: ['/data/unitSource1.js', '/data/unitSource2.js'],
            globalExterns: ['/data/globalExterns1.js', '/data/globalExterns2.js'],
            unitExterns: ['/data/unitExterns1.js', '/data/unitExterns2.js'],
            globalBuildOptions: ['globalOption1', 'globalOption2'],
            unitBuildOptions: ['unitOption1', 'unitOption2'],
            outputFile: null,
            globalWarningsFilterFile: ['/data/globalWarningsFilterFile1.txt',
                                       '/data/globalWarningsFilterFile2.txt'],
            unitWarningsFilterFile: ['/data/unitWarningsFilterFile1.txt', '/data/unitWarningsFilterFile2.txt']
        };
        var compilationResult2 = {stdout: 'console.log(\'Hello World!!!\')'};
        var compilerConfiguration3 = {
            workingDirectory: '.',
            unitName: 'unit2',
            globalSources: ['/data/globalSource1.js'],
            unitSources: [],
            globalExterns: ['/data/globalExterns1.js', '/data/globalExterns2.js'],
            unitExterns: [],
            globalBuildOptions: [],
            unitBuildOptions: ['unitOption'],
            outputFile: null,
            globalWarningsFilterFile: ['/data/globalWarningsFilterFile1.txt',
                                       '/data/globalWarningsFilterFile2.txt'],
            unitWarningsFilterFile: ['/data/unitWarningsFilterFile1.txt', '/data/unitWarningsFilterFile2.txt']
        };
        var compilationResult3 = {stdout: 'console.log(\'Hello World!\')'};

        it('writes a new compilation unit into the cache if the cache is empty', function (done) {
            var cache = new CCCache('/tmp/write/cache1/');
            cache.write(compilerConfiguration1, compilationResult1)
                .then(function () {
                    cache.persist()
                        .then(function () {
                            expect(fs.readdirSync('/tmp/write/cache1').length).toBe(2);
                            expect(function () {
                                fs.accessSync('/tmp/write/cache1/bibliography.json', fs.F_OK || fs.R_OK || fs.W_OK);
                            }).not.toThrow();
                            var bib;
                            expect(function () {
                                bib = JSON.parse(fs.readFileSync('/tmp/write/cache1/bibliography.json'));
                            }).not.toThrow();
                            expect(Object.keys(bib).length).toBe(1);
                            expect(bib.unit1).toBeDefined();
                            expect(bib.unit1).not.toBeNull();
                            expect(bib.unit1).toEqual(jasmine.any(String));
                            expect(function () {
                                fs.accessSync(path.join('/tmp/write/cache1/', bib.unit1 + '.json'),
                                              fs.F_OK || fs.R_OK || fs.W_OK);
                            }).not.toThrow();
                            var cachedResult;
                            expect(function () {
                                cachedResult = JSON.parse(fs.readFileSync(path.join('/tmp/write/cache1/',
                                                                                    bib.unit1 + '.json')));
                            }).not.toThrow();
                            expect(cachedResult).toEqual(compilationResult1);
                            done();
                        })
                        .catch(done.fail);
                })
                .catch(done.fail);
        });

        it('deletes an existing compilation unit from the cache and writes a new one into the cache', function (done) {
            var cache = new CCCache('/tmp/write/cache2/');
            cache.write(compilerConfiguration1, compilationResult1)
                .then(function () {
                    return cache.persist();
                })
                .then(function () {
                    var hash1 = JSON.parse(fs.readFileSync('/tmp/write/cache2/bibliography.json')).unit1;
                    var result1 = JSON.parse(fs.readFileSync(path.join('/tmp/write/cache2/', hash1 + '.json'), 'utf8'));
                    expect(result1).toEqual(compilationResult1);
                    return cache.write(compilerConfiguration2, compilationResult2);
                })
                .then(function () {
                    return cache.persist();
                })
                .then(function () {
                    var bib = JSON.parse(fs.readFileSync('/tmp/write/cache2/bibliography.json'));
                    expect(Object.keys(bib).length).toBe(1);
                    expect(bib.unit1).toBeDefined();
                    expect(bib.unit1).not.toBeNull();
                    expect(bib.unit1).toEqual(jasmine.any(String));
                    expect(function () {
                        fs.accessSync(path.join('/tmp/write/cache2/', bib.unit1 + '.json'),
                                      fs.F_OK || fs.R_OK || fs.W_OK);
                    }).not.toThrow();
                    var cachedResult;
                    expect(function () {
                        cachedResult = JSON.parse(fs.readFileSync(path.join('/tmp/write/cache2/',
                                                                            bib.unit1 + '.json'), 'utf8'));
                    }).not.toThrow();
                    expect(cachedResult).toEqual(compilationResult2);
                    expect(fs.readdirSync('/tmp/write/cache2/').length).toBe(2);
                    done();
                })
                .catch(done.fail);
        });

        it('writes a new compilation unit into the cache if the cache is not empty', function (done) {
            var cache = new CCCache('/tmp/write/cache3/');
            cache.write(compilerConfiguration1, compilationResult1)
                .then(function () {
                    return cache.write(compilerConfiguration3, compilationResult3);
                })
                .then(function () {
                    return cache.persist();
                })
                .then(function () {
                    var bib = JSON.parse(fs.readFileSync('/tmp/write/cache3/bibliography.json'));
                    var file1 = JSON.parse(fs.readFileSync(path.join('/tmp/write/cache3/', bib.unit1 + '.json'), 'utf8'));
                    var file2 = JSON.parse(fs.readFileSync(path.join('/tmp/write/cache3/', bib.unit2 + '.json'), 'utf8'));
                    expect(Object.keys(bib).length).toBe(2);
                    expect(bib.unit1).toBeDefined();
                    expect(bib.unit1).not.toBeNull();
                    expect(bib.unit1).toEqual(jasmine.any(String));
                    expect(bib.unit2).toBeDefined();
                    expect(bib.unit2).not.toBeNull();
                    expect(bib.unit2).toEqual(jasmine.any(String));
                    expect(function () {
                        fs.accessSync(path.join('/tmp/write/cache3/', bib.unit1 + '.json'),
                                      fs.F_OK || fs.R_OK || fs.W_OK);
                    }).not.toThrow();
                    var cachedResult;
                    expect(function () {
                        cachedResult = JSON.parse(fs.readFileSync(path.join('/tmp/write/cache3/',
                                                                            bib.unit1 + '.json')));
                    }).not.toThrow();
                    expect(cachedResult).toEqual(compilationResult1);
                    expect(function () {
                        fs.accessSync(path.join('/tmp/write/cache3/', bib.unit2 + '.json'),
                                      fs.F_OK || fs.R_OK || fs.W_OK);
                    }).not.toThrow();
                    expect(function () {
                        cachedResult = JSON.parse(fs.readFileSync(path.join('/tmp/write/cache3/',
                                                                            bib.unit2 + '.json')));
                    }).not.toThrow();
                    expect(cachedResult).toEqual(compilationResult3);
                    expect(fs.readdirSync('/tmp/write/cache3/').length).toBe(3);
                    done();
                })
                .catch(done.fail);
        });
    });

    describe('.get()', function () {
        it('throws an error if the compilation unit does not exist', function () {
        });

        it('returns cached compilation result', function () {
        });

        describe('updates cache in case', function () {
            it('global source files changed', function () {
            });

            it('global externs files changed', function () {
            });

            it('global flagfile changed', function () {
            });

            it('global options changed', function () {
            });

            it('unit source files changed', function () {
            });

            it('unit externs files changed', function () {
            });

            it('unit flagfile changed', function () {
            });

            it('unit options changed', function () {
            });
        });

        it('does not update cache in case the compilation unit did not change', function () {
        });
    });

    describe('.clean()', function () {
        it('cleans a compilation unit', function () {
        });

        it('cleans a second compilation unit', function () {
        });

        it('throw an error if the compilation unit does not exist', function () {
        });

        it('cleans the complete cache', function () {
        });
    });
});
