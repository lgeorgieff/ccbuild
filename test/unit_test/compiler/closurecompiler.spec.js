'use strict';

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

function CC (compilerArguments) { }
CC.prototype.run = function (cb) { };

var CCMock = {
    compiler: CC,
    grunt: undefined,
    gulp: undefined
};

/**
 * @ignore
 * @suppress {dupicate}
 */
var ClosureCompiler = /** @type {function(new:ClosureCompiler): undefined} */
    (proxyquire('../../../src/compiler/ClosureCompiler.js',
                {'google-closure-compiler': CCMock}));

describe('Class ClosureCompiler', function () {
    it('can be instantiated', function () {
        var cc;
        expect(function () {
            cc = new ClosureCompiler();
        }).not.toThrow();
        expect(cc).toBeDefined();
        expect(cc).not.toBeNull();
        expect(cc).toEqual(jasmine.any(ClosureCompiler));
    });

    it('is derieved from Compiler', function () {
        expect(new ClosureCompiler()).toEqual(jasmine.any(Compiler));
    });

    describe('method .compile()', function () {
        var compilerConfiguration = {
            workingDirectory: '.',
            unitName: 'unit1',
            globalSources: ['globalSource1.js', 'globalSource2.js'],
            unitSources: ['unitSource1.js', 'unitSource2.js'],
            globalExterns: ['globalExterns1.js', 'globalExterns2.js'],
            unitExterns: ['unitExterns1.js', 'unitExterns2.js'],
            globalBuildOptions: ['globalOption1', 'globalOption2'],
            unitBuildOptions: ['unitOption1', 'unitOption2'],
            outputFile: null,
            globalWarningsFilterFile: ['globalWarningsFilterFile1.txt', 'globalWarningsFilterFile2.txt'],
            unitWarningsFilterFile: ['unitWarningsFilterFile1.txt', 'unitWarningsFilterFile2.txt']
        };
        var compilationResult = {stdout: 'console.log(\'Hello World!\')'};

        var compiler;
        beforeEach(function () {
            compiler = new ClosureCompiler();
        });

        it('resolves in case of error', function (done) {
            CC.prototype.run = jasmine.createSpy('run').and.callFake(function (cb) {
                cb(1, '', 'error 123');
            });

            compiler.compile(compilerConfiguration)
                .then(function (compilationResult) {
                    expect(compilationResult.code).toBe(1);
                    expect(compilationResult.stdout).toBe('');
                    expect(compilationResult.stderr).toBe('error 123');
                    expect(Object.keys(compilationResult).length).toBe(3);
                    done();
                })
                .catch(done.fail);
        });

        it('resolves in case of warning', function (done) {
            CC.prototype.run = jasmine.createSpy('run').and.callFake(function (cb) {
                cb(0, 'console.log(123);', 'warning 123');
            });

            compiler.compile(compilerConfiguration)
                .then(function (compilationResult) {
                    expect(compilationResult.code).toBe(0);
                    expect(compilationResult.stdout).toBe('console.log(123);');
                    expect(compilationResult.stderr).toBe('warning 123');
                    expect(Object.keys(compilationResult).length).toBe(3);
                    done();
                })
                .catch(done.fail);
        });

        it('resolves in case of success', function (done) {
            CC.prototype.run = jasmine.createSpy('run').and.callFake(function (cb) {
                cb(0, 'console.log(123);', '');
            });

            compiler.compile(compilerConfiguration)
                .then(function (compilationResult) {
                    expect(compilationResult.code).toBe(0);
                    expect(compilationResult.stdout).toBe('console.log(123);');
                    expect(compilationResult.stderr).toBe('');
                    expect(Object.keys(compilationResult).length).toBe(3);
                    done();
                })
                .catch(done.fail);
        });
    });
});
