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
var Compiler = /** @type {function(new:Compiler): undefined} */ (require('../../../src/compiler/Compiler.js'));

describe('Class Compiler', function () {
    it('declares the instance method .compile()', function () {
        var compiler = new Compiler();
        expect(compiler.compile).toBeDefined();
        expect(compiler.compile).toEqual(jasmine.any(Function));
    });

    it('defines the class method getCompilerArguments', function () {
        expect(Compiler.getCompilerArguments).toBeDefined();
        expect(Compiler.getCompilerArguments).toEqual(jasmine.any(Function));
    });

    describe('.getCompilerAguments()', function () {
        it('processes empty config for unit properly', function () {
            expect(Compiler.getCompilerArguments ({})).toEqual([]);
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

            var compilerArguments = Compiler.getCompilerArguments(unitConfiguration1);
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
            compilerArguments = Compiler.getCompilerArguments (unitConfiguration2);
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
            compilerArguments = Compiler.getCompilerArguments (unitConfiguration3);
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

        it('processes outputFile config properly', function () {
            var unitConfiguration1 = {
                unitExterns: ['externs1.js'],
                unitSources: ['sources1.js'],
                outputFile: 'out.js'
            };
            var compilerArguments = Compiler.getCompilerArguments (unitConfiguration1);
            expect(compilerArguments.length).toBe(6);
            expect(compilerArguments).toEqual(jasmine.arrayContaining(['--js', 'sources1.js', '--externs',
                                                                       'externs1.js', '--js_output_file', 'out.js']));
        });

        it('takes into account --js option in buildOptions', () => {
            var unitConfiguration1 = {
                unitBuildOptions: ['--js', 'source2.js'],
                unitSources: ['source1.js']
            };
            var compilerArguments = Compiler.getCompilerArguments (unitConfiguration1);
            expect(compilerArguments.length).toBe(4);
            expect(compilerArguments).toEqual(jasmine.arrayContaining(['--js', 'source1.js',
                                                                       '--js', 'source2.js']));
        });

        it('takes into account --js option in global buildOptions', () => {
            var unitConfiguration1 = {
                globalBuildOptions: ['--js', 'source2.js'],
                unitSources: ['source1.js']
            };
            var compilerArguments = Compiler.getCompilerArguments(unitConfiguration1);
            expect(compilerArguments.length).toBe(4);
            expect(compilerArguments).toEqual(jasmine.arrayContaining(['--js', 'source1.js',
                                                                       '--js', 'source2.js']));
        });

        it('takes into account --externs option in buildOptions', () => {
            var unitConfiguration1 = {
                unitBuildOptions: ['--externs', 'externs2.js'],
                unitExterns: ['externs1.js']
            };
            var compilerArguments = Compiler.getCompilerArguments(unitConfiguration1);
            expect(compilerArguments.length).toBe(4);
            expect(compilerArguments).toEqual(jasmine.arrayContaining(['--externs', 'externs1.js',
                                                                       '--externs', 'externs2.js']));
        });

        it('takes into account --externs option in global buildOptions', () => {
            var unitConfiguration1 = {
                globalBuildOptions: ['--externs', 'externs2.js'],
                unitExterns: ['externs1.js']
            };
            var compilerArguments = Compiler.getCompilerArguments(unitConfiguration1);
            expect(compilerArguments.length).toBe(4);
            expect(compilerArguments).toEqual(jasmine.arrayContaining(['--externs', 'externs1.js',
                                                                       '--externs', 'externs2.js']));
        });

        it('takes into account --js_output_file option in buildOptions', () => {
            var unitConfiguration1 = {
                unitBuildOptions: ['--js_output_file', 'out.js'],
                unitExterns: ['externs1.js']
            };
            var compilerArguments = Compiler.getCompilerArguments(unitConfiguration1);
            expect(compilerArguments.length).toBe(4);
            expect(compilerArguments).toEqual(jasmine.arrayContaining(['--externs', 'externs1.js',
                                                                       '--js_output_file', 'out.js']));
        });

        it('takes into account --js_output_file option in global buildOptions', () => {
            var unitConfiguration1 = {
                globalBuildOptions: ['--js_output_file', 'out.js'],
                unitExterns: ['externs1.js']
            };
            var compilerArguments = Compiler.getCompilerArguments(unitConfiguration1);
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
                Compiler.getCompilerArguments(unitConfiguration1);
            }).toThrowError();
        });

        it('throws in case of outputFile config and --js_output_file global build option', function () {
            var unitConfiguration1 = {
                globalBuildOptions: ['--js_output_file', 'out.js'],
                outputFile: 'anotherOutputFile.js',
                unitExterns: ['externs1.js']
            };
            expect(function () {
                Compiler.getCompilerArguments(unitConfiguration1);
            }).toThrowError();
        });
    });
});
