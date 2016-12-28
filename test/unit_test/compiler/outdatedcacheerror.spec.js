'use strict';

/**
 * @ignore
 * @suppress {dupicate}
 */
var OutdatedCacheError = /** @type {function(new:OutdatedCacheError, string, string, string, string): undefined} */
    (require('../../../src/compiler/OutdatedCacheError.js'));

describe('Class OutdatedCacheError', function () {
    describe('can be instantiated', function () {
        it('with correct parameters', function () {
            var err;
            expect(function () {
                err = new OutdatedCacheError('unit1', 'unit1#outdated-hash', 'unit1#valid-hash',
                                             '/cache/folder/location');
            }).not.toThrow();
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(OutdatedCacheError));
        });

        it('with incorrect parameters', function () {
            var err;
            expect(function () {
                err = new OutdatedCacheError(123, {}, '???', ['some string value']);
            }).not.toThrow();
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(OutdatedCacheError));
        });

        it('without parameters', function () {
            var err;
            expect(function () {
                err = new OutdatedCacheError();
            }).not.toThrow();
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(OutdatedCacheError));
        });
    });

    it('inherits from Error', function () {
        expect(new OutdatedCacheError()).toEqual(jasmine.any(Error));
    });

    describe('the method', function () {
        var err;
        var unitName = 'unit1';
        var outdatedUnitHash = 'unit1#outdated-hash';
        var validUnitHash = 'unit1#valid-hash';
        var cacheFolder = '/cache/folder/location';
        beforeEach(function () {
            err = new OutdatedCacheError(unitName, outdatedUnitHash, validUnitHash, cacheFolder);
        });

        it('.getCompilationUnitName() returns the name of the compilation unit for the error context', function () {
            expect(err.getCompilationUnitName()).toBe(unitName);
        });

        it('.getOutdatedCompilationUnitHash() returns the outdated hash of the compilation unit for the error context',
           function () {
               expect(err.getOutdatedCompilationUnitHash()).toBe(outdatedUnitHash);
           });

        it('.getValidCompilationUnitHash() returns the valid hash of the compilation unit for the error context',
           function () {
               expect(err.getValidCompilationUnitHash()).toBe(validUnitHash);
           });

        it('.getCacheFolderLocation() returns the name of the cache location for the error context', function () {
            expect(err.getCacheFolderLocation()).toBe(cacheFolder);
        });
    });
});
