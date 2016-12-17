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

    describe('.constructor', function () {
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
});
