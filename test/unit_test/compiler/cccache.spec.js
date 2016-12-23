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

    describe('.write()', function () {
        beforeEach(function () {
            mockFs({
                '/tmp/write/cache1': {
                }
            });
        });

        afterEach(function () {
            mockFs.restore();
        });

        it('writes a new compilation unit into the cache if the cache is empty', function (done) {
            var cache = new CCCache('/tmp/write/cache1/');

            /**
             * @typedef {{workingDirectory: !string,
             *            unitName: !string,
             *            globalSources: !Array<string>,
             *            unitSources: !Array<string>,
             *            globalExterns: !Array<string>,
             *            unitExterns: !Array<string>,
             *            globalBuildOptions: !Array<string>,
             *            unitBuildOptions: !Array<string>,
             *            outputFile: (?string|undefined),
             *            globalWarningsFilterFile: Array<string>,
             *            unitWarningsFilterFile: Array<string>}}
             */

            var compilerConfiguraton = {
                workingDirectory: '.',
                unitName: 'unit1',
                globalSources: [],
                unitSources: [],
                globalExterns: [],
                unitExterns: [],
                globalBuildOptions: [],
                unitBuildOptions: [],
                outputFile: null,
                globalWarningsFilterFile: [],
                unitWarningsFilterFile: []
            };
            var compilationResult = null;
            cache.write(compilerConfiguraton, compilationResult)
                .then(done)
                .catch(done.fail);

            var fs = require('fs');
            console.log('>>');
            console.dir(fs.readdirSync('/tmp/write/cache1'));
            console.log('<<');
        });

        it('deletes an existing compilation unit from the cache an writes a new one into the cache', function () {
        });

        it('writes a new compilation unit into the cache if the cache is not empty', function () {
        });
    });

    describe('.get()', function () {
        it('throws an error if the compilation unit does not exist', function () {
        });

        it('return cached compilation result', function () {
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

    describe('.destroy()', function () {
        it('writes changes to index file', function () {
        });
    });
});
