'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var fs = require('fs');

/**
 * @ignore
 * @suppress {duplicate}
 */
var path = require('path');

/**
 * @ignore
 * @suppress {duplicate}
 */
var Q = require('q');

/**
 * @ignore
 * @suppress {duplicate}
 */
var mkdirp = require('mkdirp');

/**
 * @ignore
 * @suppress {dupicate}
 */
var mockFs = require('mock-fs');

/**
 * @ignore
 * @suppress {duplicate}
 */
var proxyquire = require('proxyquire');

/**
 * @ignore
 * @suppress {dupicate}
 */
var Compiler = /** @type {function(new:Compiler): undefined} */ (require('../../../src/compiler/Compiler.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var NotFoundInCacheError = /** @type {function (new:NotFoundInCacheError, string, string, string): undefined}*/
    (require('../../../src/compiler/NotFoundInCacheError.js'));

var CACHE_FOLDER = '/tmp/some/cache/folder';

var ClosureCompilerMock = function () {};
ClosureCompilerMock.prototype.compile = function (args) {};

var CCCacheMock = function () {};

CCCacheMock.prototype.getCacheFolder = function () {
    return CACHE_FOLDER;
};

CCCacheMock.prototype.get = function () {
    return Q.reject(new NotFoundInCacheError('unit1', 'unit1#hash', CACHE_FOLDER));
};

CCCacheMock.prototype.write = function () {
    return Q.resolve();
};

CCCacheMock.prototype.persist = function () {
    return Q.resolve();
};

/**
 * @ignore
 * @suppress {dupicate}
 */
var CachingCompiler = /** @type {function(new:ClosureCompiler): undefined} */
    (proxyquire('../../../src/compiler/CachingCompiler.js',
                {'./ClosureCompiler.js': ClosureCompilerMock,
                 './CCCache.js': CCCacheMock}));

describe('Class CachingCompiler', function () {
    beforeEach(function () {
        mockFs({});
    });

    afterEach(function () {
        mockFs.restore();
    });

    it('can be instantiated', function () {
        var cc;
        expect(function () {
            cc = new CachingCompiler(CACHE_FOLDER);
        }).not.toThrow();
        expect(cc).toBeDefined();
        expect(cc).not.toBeNull();
        expect(cc).toEqual(jasmine.any(CachingCompiler));
    });

    it('throws in case cacheFolder parameter is not set correctly', function () {
        expect(function () {
            cc = new CachingCompiler('\r\n\n   \t ');
        }).toThrowError();
    });

    it('throws in case cacheFolder parameter is missing', function () {
        expect(function () {
            cc = new CachingCompiler();
        }).toThrowError();
    });

    it('is derieved from Compiler', function () {
        expect(new CachingCompiler(CACHE_FOLDER)).toEqual(jasmine.any(Compiler));
    });

    describe('method .compile()', function () {
        var compilerConfiguration = {
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

        beforeEach(function () {
            ClosureCompilerMock.prototype.compile = function (args) {
                return Q.resolve();
            };
        });

        it('creates cache folder in case it does not exist', function (done) {
            var compiler = new CachingCompiler(CACHE_FOLDER);
            compiler.compile(compilerConfiguration)
                .then(function (compilationResult) {
                    expect(function () {
                        fs.statSync(CACHE_FOLDER);
                    }).not.toThrow();
                    expect(fs.statSync(CACHE_FOLDER).isDirectory()).toBeTruthy();
                    expect(function () {
                        fs.accessSync(CACHE_FOLDER, fs.R_OK | fs.X_OK | fs.W_OK);
                    }).not.toThrow();
                    done();
                })
                .catch(done.fail);
        });

        it('does not reject in case cache folder cannot be created', function (done) {
            mkdirp.sync(path.dirname(CACHE_FOLDER), {mode: 0o775});
            fs.writeFileSync(CACHE_FOLDER, '');
            var compiler = new CachingCompiler(CACHE_FOLDER);
            compiler.compile(compilerConfiguration)
                .then(function (compilationResult) {
                    done();
                })
                .catch(done.fail);
        });

        describe('uses ClosureCompiler to compile unit if not in cache', function () {
            it('compilation completes in case of success', function (done) {
                var result = {code: 0, stdout: 'console.log(\'Hello World!\');', stderr: ''};
                ClosureCompilerMock.prototype.compile =
                    jasmine.createSpy('compile').and.returnValue(Q.resolve(result));

                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });

            it('compilation completes in case of warnings', function (done) {
                var result = {code: 0, stdout: 'console.log(\'Hello World!\');', stderr: 'warning abc ...'};
                ClosureCompilerMock.prototype.compile =
                    jasmine.createSpy('compile').and.returnValue(Q.resolve(result));

                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });

            it('compilation completes in case of errors', function (done) {
                var result = {code: 1, stdout: '', stderr: 'warning abc ...'};
                ClosureCompilerMock.prototype.compile =
                    jasmine.createSpy('compile').and.returnValue(Q.resolve(result));

                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });
        });

        describe('completes compilation in case CCCache', function () {
            beforeEach(function () {
                CCCacheMock.prototype.get = function () {
                    return Q.reject(new NotFoundInCacheError('unit1', 'unit1#hash', CACHE_FOLDER));
                };
            });

            var result;
            beforeEach(function () {
                result = {code: 0, stdout: 'console.log(\'Hello World!\');', stderr: ''};
                ClosureCompilerMock.prototype.compile =
                    jasmine.createSpy('compile').and.returnValue(Q.resolve(result));
            });

            it('.get() fails', function (done) {
                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });

            it('.write() fails', function (done) {
                CCCacheMock.prototype.write = function () {
                    return Q.reject(new Error());
                };

                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });

            it('.persist() fails', function (done) {
                CCCacheMock.prototype.write = function () {
                    return Q.reject(new Error());
                };

                CCCacheMock.prototype.persist = function () {
                    return Q.resolve();
                };

                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });
        });

        describe('uses CCCache to get compiled results from cache', function () {
            var result = {code: 0, stdout: 'console.log(\'Hello World!!!\');', stderr: ''};

            beforeEach(function () {
                CCCacheMock.prototype.get = jasmine.createSpy('get').and.returnValue(Q.resolve(result));
                CCCacheMock.prototype.write = jasmine.createSpy('write').and.returnValue(Q.resolve());
                CCCacheMock.prototype.persist = jasmine.createSpy('persist').and.returnValue(Q.resolve());
                ClosureCompilerMock.prototype.compile = jasmine.createSpy('compile').and.returnValue(Q.resolve(result));
            });

            it('calls CCCache::get', function (done) {
                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(CCCacheMock.prototype.get).toHaveBeenCalledWith(compilerConfiguration);
                        expect(CCCacheMock.prototype.get.calls.count()).toBe(1);
                        expect(ClosureCompilerMock.prototype.compile).not.toHaveBeenCalled();
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });

            it('calls CCCache::write to update compilation results', function (done) {
                CCCacheMock.prototype.get = jasmine.createSpy('get').and
                    .returnValue(Q.reject(new NotFoundInCacheError('unit1', 'unit1#hash', CACHE_FOLDER)));
                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(CCCacheMock.prototype.write).toHaveBeenCalledWith(compilerConfiguration, result);
                        expect(CCCacheMock.prototype.write.calls.count()).toBe(1);
                        expect(ClosureCompilerMock.prototype.compile).toHaveBeenCalledWith(compilerConfiguration);
                        expect(ClosureCompilerMock.prototype.compile.calls.count()).toBe(1);
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });

            it('calls CCCache::persist to update compilation results', function (done) {
                CCCacheMock.prototype.get = jasmine.createSpy('get').and
                    .returnValue(Q.reject(new NotFoundInCacheError('unit1', 'unit1#hash', CACHE_FOLDER)));
                var compiler = new CachingCompiler(CACHE_FOLDER);
                compiler.compile(compilerConfiguration)
                    .then(function (compilationResult) {
                        expect(CCCacheMock.prototype.persist).toHaveBeenCalled();
                        expect(CCCacheMock.prototype.persist.calls.count()).toBe(1);
                        expect(ClosureCompilerMock.prototype.compile).toHaveBeenCalledWith(compilerConfiguration);
                        expect(ClosureCompilerMock.prototype.compile.calls.count()).toBe(1);
                        expect(compilationResult).toEqual(result);
                        done();
                    })
                    .catch(done.fail);
            });
        });
    });
});
