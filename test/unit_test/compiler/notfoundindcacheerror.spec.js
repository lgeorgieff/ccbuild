'use strict';

/**
 * @ignore
 * @suppress {dupicate}
 */
var NotFoundInCacheError = /** @type {function(new:NotFoundInCacheError, string, string, string): undefined} */
    (require('../../../src/compiler/NotFoundInCacheError.js'));

fdescribe('Class NotFoundInCacheError', function () {
    describe('can be instantiated', function () {
        it('with correct parameters', function () {
            var err;
            expect(function () {
                err = new NotFoundInCacheError('unit1', 'unit1#hash', '/cache/folder/location');
            }).not.toThrow();
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(NotFoundInCacheError));
        });

        it('with incorrect parameters', function () {
            var err;
            expect(function () {
                err = new NotFoundInCacheError(123, {}, ['some string value']);
            }).not.toThrow();
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(NotFoundInCacheError));
        });

        it('without parameters', function () {
            var err;
            expect(function () {
                err = new NotFoundInCacheError();
            }).not.toThrow();
            expect(err).toBeDefined();
            expect(err).not.toBeNull();
            expect(err).toEqual(jasmine.any(NotFoundInCacheError));
        });
    });

    it('inherits from Error', function () {
        expect(new NotFoundInCacheError()).toEqual(jasmine.any(Error));
    });

    describe('the method', function () {
        var err;
        var unitName = 'unit1';
        var unitHash = 'unit1#hash';
        var cacheFolder = '/cache/folder/location';
        beforeEach(function () {
            err = new NotFoundInCacheError(unitName, unitHash, cacheFolder);
        });

        it('.getCompilationUnitName() returns the name of the compilation unit for the error context', function () {
            expect(err.getCompilationUnitName()).toBe(unitName);
        });

        it('.getCompilationUnitHash() returns the hash of the compilation unit for the error context', function () {
            expect(err.getCompilationUnitHash()).toBe(unitHash);
        });

        it('.getCacheFolderLocation() returns the name of the cache location for the error context', function () {
            expect(err.getCacheFolderLocation()).toBe(cacheFolder);
        });
    });
});
