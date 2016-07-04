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
var CC = require('google-closure-compiler');

/**
 * @ignore
 * @suppress {duplicate}
 */
var VariableManager = /** @type {function(new:VariableManager, VariableManager=)}*/
    (require('../../src/VariableManager.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var ConfigurationNormalizer = /** @type {function(new:ConfigurationNormalizer, string=, string=)}*/
    (require('../../src/ConfigurationNormalizer.js'));

describe('Class ConfigurationNormalizer', function () {
    beforeEach(function () {
        /**
         * @private
         * @const
         */
        this.EMPTY_CONFIG = {checkFs: {}, sources: [], externs: [], buildOptions: [],
                             compilationUnits: {}, next: {}};
    });

    it('normalize undefined', function () {
        var configNormalizer = new ConfigurationNormalizer();
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(this.EMPTY_CONFIG);
    });

    it('normalize null', function () {
        var configNormalizer = new ConfigurationNormalizer(null);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(this.EMPTY_CONFIG);
    });

    it('normalize empty object', function () {
        var configNormalizer = new ConfigurationNormalizer({});
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(this.EMPTY_CONFIG);
    });

    it('normalize sources', function () {
        var config = {sources: ['abc', 'def', '', '/ghi']};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.sources).toBeDefined();
        expect(normalizedConfig.sources.length).toBe(4);
        expect(normalizedConfig.sources).toContain(path.join('test', 'unit_test', 'abc'));
        expect(normalizedConfig.sources).toContain(path.join('test', 'unit_test', 'def'));
        expect(normalizedConfig.sources).toContain(path.join('test', 'unit_test'));
        expect(normalizedConfig.sources).toContain('/ghi');
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize outputFile', function () {
        var config = {
            compilationUnits: {
                unit1: {
                    outputFile: path.join('abc', 'def.ghi')
                },
                unit2: {
                    outputFile: '/tmp/abc.def'
                }
            }
        };
        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.compilationUnits.unit1.outputFile).toBeDefined();
        expect(normalizedConfig.compilationUnits.unit1.outputFile).toEqual(jasmine.any(String));
        expect(normalizedConfig.compilationUnits.unit2.outputFile).toBeDefined();
        expect(normalizedConfig.compilationUnits.unit2.outputFile).toEqual(jasmine.any(String));
        expect(normalizedConfig.compilationUnits.unit1.outputFile).toBe(path.join('test', 'unit_test', 'abc', 'def.ghi'));
        expect(normalizedConfig.compilationUnits.unit2.outputFile).toBe('/tmp/abc.def');
    });
    it('normalize sources - useAbsolutePaths', function () {
        var config = {sources: ['abc', 'def', '', '/ghi']};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname, null, true);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.sources).toBeDefined();
        expect(normalizedConfig.sources.length).toBe(4);
        expect(normalizedConfig.sources).toContain(path.join(__dirname, 'abc'));
        expect(normalizedConfig.sources).toContain(path.join(__dirname, 'def'));
        expect(normalizedConfig.sources).toContain(__dirname);
        expect(normalizedConfig.sources).toContain('/ghi');
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize undefined sources', function () {
        var config = {sources: undefined};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.sources).toEqual([]);
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize null sources', function () {
        var config = {sources: null};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.sources).toEqual([]);
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize externs', function () {
        var config = {externs: ['abc', '/def/tmp.txt', 'folder/tmp.txt']};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.externs).toBeDefined();
        expect(normalizedConfig.externs.length).toBe(3);
        expect(normalizedConfig.externs).toContain(path.join('test', 'unit_test', 'abc'));
        expect(normalizedConfig.externs).toContain('/def/tmp.txt');
        expect(normalizedConfig.externs).toContain(path.join('test', 'unit_test', 'folder/tmp.txt'));
        expect(normalizedConfig.sources).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize externs', function () {
        var config = {externs: ['abc', '/def/tmp.txt', 'folder/tmp.txt']};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname, null, true);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.externs).toBeDefined();
        expect(normalizedConfig.externs.length).toBe(3);
        expect(normalizedConfig.externs).toContain(path.resolve(__dirname, 'abc'));
        expect(normalizedConfig.externs).toContain(path.resolve('/def/tmp.txt'));
        expect(normalizedConfig.externs).toContain(path.resolve(__dirname, 'folder/tmp.txt'));
        expect(normalizedConfig.sources).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize undefined externs', function () {
        var config = {externs: undefined};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.sources).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize null externs', function () {
        var config = {externs: null};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.sources).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize buildOptions object', function () {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        var config = {
            buildOptions: {
                compilation_level: 'ADVANCED',
                language_in: 'ECMASCRIPT6_STRICT',
                debug: true,
                jscomp_off: ['checkRegExp', 'checkTypes', 'checkVars'],
                does_not_exist: false
            }
        };
        // jscs:enable RequireCamelCaseOrUpperCaseIdentifiers

        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.sources).toEqual([]);
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual(
            ['--compilation_level', 'ADVANCED',
             '--language_in', 'ECMASCRIPT6_STRICT',
             '--debug',
             '--jscomp_off', 'checkRegExp',
             '--jscomp_off', 'checkTypes',
             '--jscomp_off', 'checkVars']);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize buildOptions array', function () {
        var config = {
            buildOptions:
            ['--compilation_level', 'ADVANCED',
             '--language_in', 'ECMASCRIPT6_STRICT',
             '--debug',
             '--jscomp_off', 'checkRegExp',
             '--jscomp_off', 'checkTypes',
             '--jscomp_off', 'checkVars']};
        var configNormalizer = new ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.sources).toEqual([]);
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual(
            ['--compilation_level', 'ADVANCED',
             '--language_in', 'ECMASCRIPT6_STRICT',
             '--debug',
             '--jscomp_off', 'checkRegExp',
             '--jscomp_off', 'checkTypes',
             '--jscomp_off', 'checkVars']);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize invalid externs', function () {
        var configNormalizer = new ConfigurationNormalizer({externs: {}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({externs: [{}]});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({externs: [12]});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({externs: ['abc', 12, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({externs: ['abc', undefined, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({externs: ['abc', null, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));
    });

    it('normalize invalid sources', function () {
        var configNormalizer = new ConfigurationNormalizer({sources: {}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({sources: [{}]});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({sources: [12]});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({sources: ['abc', 12, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({sources: ['abc', undefined, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({sources: ['abc', null, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));
    });

    it('normalize invalid buildOptions', function () {
        var configNormalizer = new ConfigurationNormalizer({buildOptions: {compilation_level: undefined}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({buildOptions: {compilation_level: null}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({buildOptions: {compilation_level: 2}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({buildOptions: {compilation_level: {}}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({buildOptions: {compilation_level: [1]}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({buildOptions: {compilation_level: [undefined]}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new ConfigurationNormalizer({buildOptions: {compilation_level: [null]}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));
    });

    it('normalize build options with = characters', function () {
        var config = Object.assign({}, this.EMPTY_CONFIG);
        config.buildOptions = [
            '--js=file1.js',
            '--js=file2.js',
            '--js', 'file3.js'
        ];
        var configNormalizer = new ConfigurationNormalizer(config);
        var normalizedConfiguration = configNormalizer.normalize();
        expect(normalizedConfiguration.buildOptions).toBeDefined();
        expect(normalizedConfiguration.buildOptions).toEqual(jasmine.any(Array));
        expect(normalizedConfiguration.buildOptions.length).toBe(6);
        expect(normalizedConfiguration.buildOptions)
            .toEqual(['--js', 'file1.js', '--js', 'file2.js', '--js', 'file3.js']);

        config.buildOptions = [
            '--js=file1.js',
            '--js=file2.js',
            '--js', 'file3.js',
            '--externs=externs1.js',
            '--externs', 'externs1.js',
            '--externs=externs2.js'
        ];
        configNormalizer = new ConfigurationNormalizer(config);
        normalizedConfiguration = configNormalizer.normalize();
        expect(normalizedConfiguration.buildOptions).toBeDefined();
        expect(normalizedConfiguration.buildOptions).toEqual(jasmine.any(Array));
        expect(normalizedConfiguration.buildOptions.length).toBe(12);
        expect(normalizedConfiguration.buildOptions)
            .toEqual(['--js', 'file1.js', '--js', 'file2.js', '--js', 'file3.js', '--externs', 'externs1.js',
                      '--externs', 'externs1.js', '--externs', 'externs2.js']);

        config.buildOptions = [
            '--js=file1.js',
            '--js=file2.js',
            '--js', 'file3.js',
            '--externs=externs1.js',
            '--externs', 'externs1.js',
            '--externs=externs2.js',
            '--js=fil=e4.js'
        ];
        configNormalizer = new ConfigurationNormalizer(config);
        normalizedConfiguration = configNormalizer.normalize();
        expect(normalizedConfiguration.buildOptions).toBeDefined();
        expect(normalizedConfiguration.buildOptions).toEqual(jasmine.any(Array));
        expect(normalizedConfiguration.buildOptions.length).toBe(14);
        expect(normalizedConfiguration.buildOptions)
            .toEqual(['--js', 'file1.js', '--js', 'file2.js', '--js', 'file3.js', '--externs', 'externs1.js',
                      '--externs', 'externs1.js', '--externs', 'externs2.js', '--js', 'fil=e4.js']);

        config.buildOptions = [
            '--js=file1.js',
            '--js=file2.js',
            '--js', 'file3.js',
            '--externs=externs1.js',
            '--externs', 'externs1.js',
            '--externs=externs2.js',
            '--js=fil=e4.js',
            '--js=fil=e4.js=',
            '--js='
        ];
        configNormalizer = new ConfigurationNormalizer(config);
        normalizedConfiguration = configNormalizer.normalize();
        expect(normalizedConfiguration.buildOptions).toBeDefined();
        expect(normalizedConfiguration.buildOptions).toEqual(jasmine.any(Array));
        expect(normalizedConfiguration.buildOptions.length).toBe(18);
        expect(normalizedConfiguration.buildOptions)
            .toEqual(['--js', 'file1.js', '--js', 'file2.js', '--js', 'file3.js', '--externs', 'externs1.js',
                      '--externs', 'externs1.js', '--externs', 'externs2.js', '--js', 'fil=e4.js', '--js', 'fil=e4.js=',
                      '--js', '']);
    });

    describe ('resolves variables if instantiated properly', function () {
        var vm;
        var cn;
        var normalizedConfig;
        var config;
        beforeEach (function () {
            config = {
                checkFs: {
                    check: ['.', '${CONTRIB_PATH}'],
                    ignore: ['${CONTRIB_PATH}', '${CWD}'],
                    fileExtensions: ['${CONTRIB_PATH}']
                },
                sources: ['someFile.js', '${CONTRIB_PATH}/${CWD}/some/file.js', '${CWD}/some/file.js'],
                externs: ['someFile.js', '${CONTRIB_PATH}/${CWD}/some/file.js', '${CWD}/some/file.js'],
                buildOptions: {
                    flagfile: '${CONTRIB_PATH}/flagfile.closure_compiler',
                    version: true
                },
                compilationUnits: {
                    '${CONTRIB_PATH}/some/parts/${CONTRIB_PATH}/${CWD}': {
                        sources: ['someFile.js', '${CONTRIB_PATH}/${CWD}/some/file.js', '${CWD}/some/file.js'],
                        externs: ['someFile.js', '${CONTRIB_PATH}/${CWD}/some/file.js', '${CWD}/some/file.js'],
                        buildOptions: ['--flagfile', '${CWD}/flagfile.closure_compiler', '--version']
                    },
                    'some/unit': {
                        sources: ['someFile.js'],
                        externs: ['someFile.js'],
                        buildOptions: ['--flagfile', '${flagfile.closure_compiler', '--version'],
                        outputFile: path.join('${CWD}', 'abc', 'def.ghi')
                    }
                },
                next: {
                    '${CONTRIB_PATH}/some/other/${CONTRIB_PATH}/folders/${CWD}': {
                        inheritSources: true,
                        inheritExterns: true,
                        inheritBuildOptions: true
                    },
                    'some/path': {
                        inheritSources: true,
                        inheritExterns: true,
                        inheritBuildOptions: true
                    }
                }
            };
        });

        describe('with relative paths', function () {
            var ccc = path.join('node_modules', 'google-closure-compiler', 'contrib');
            var cu1 = ccc + '/some/parts/' + ccc + '/.';

            beforeEach(function () {
                vm = new VariableManager();
                vm.set('CONTRIB_PATH', path.relative(process.cwd(), CC.compiler.CONTRIB_PATH));
                vm.set('CWD', '.');
                cn = new ConfigurationNormalizer(config, null, vm);
                normalizedConfig = cn.normalize();
            });

            it('normalize variables in checkFs.check', function () {
                expect(normalizedConfig.checkFs).toBeDefined();
                expect(normalizedConfig.checkFs).not.toBeNull();
                expect(normalizedConfig.checkFs.check).toBeDefined();
                expect(normalizedConfig.checkFs.check).not.toBeNull();
                expect(normalizedConfig.checkFs.check.length).toBe(2);
                expect(normalizedConfig.checkFs.check).toEqual(jasmine.arrayContaining(['.', ccc]));
            });

            it('normalize variables in checkFs.ignore', function () {
                expect(normalizedConfig.checkFs.ignore).toBeDefined();
                expect(normalizedConfig.checkFs.ignore).not.toBeNull();
                expect(normalizedConfig.checkFs.ignore.length).toBe(2);
                expect(normalizedConfig.checkFs.ignore).toEqual(jasmine.arrayContaining(['.', ccc]));
            });

            it('normalize variables in checkFs.fileExtensions', function () {
                expect(normalizedConfig.checkFs.fileExtensions).toBeDefined();
                expect(normalizedConfig.checkFs.fileExtensions).not.toBeNull();
                expect(normalizedConfig.checkFs.fileExtensions.length).toBe(1);
                expect(normalizedConfig.checkFs.fileExtensions).toEqual([ccc]);
            });

            it('normalize variables in global sources', function () {
                expect(normalizedConfig.sources).toBeDefined();
                expect(normalizedConfig.sources).not.toBeNull();
                expect(normalizedConfig.sources.length).toBe(3);
                expect(normalizedConfig.sources).toEqual(jasmine.arrayContaining(
                    ['someFile.js', path.join(ccc, 'some', 'file.js'), path.join('some', 'file.js')]));
            });

            it('normalize variables in global externs', function () {
                expect(normalizedConfig.externs).toBeDefined();
                expect(normalizedConfig.externs).not.toBeNull();
                expect(normalizedConfig.externs.length).toBe(3);
                expect(normalizedConfig.externs).toEqual(jasmine.arrayContaining(
                    ['someFile.js', path.join(ccc, 'some', 'file.js'), path.join('some', 'file.js')]));
            });

            it('normalize variables in global buildOptions', function () {
                expect(normalizedConfig.buildOptions).toBeDefined();
                expect(normalizedConfig.buildOptions).not.toBeNull();
                expect(normalizedConfig.buildOptions.length).toBe(3);
                expect(normalizedConfig.buildOptions).toEqual(jasmine.arrayContaining(
                    ['--version', '--flagfile', path.join(ccc, 'flagfile.closure_compiler')]));
            });

            it('normalize variables in compilationUnits\' keys', function () {
                expect(normalizedConfig.compilationUnits).toBeDefined();
                expect(normalizedConfig.compilationUnits).not.toBeNull();
                expect(Object.keys(normalizedConfig.compilationUnits).length).toBe(2);
                expect(Object.keys(normalizedConfig.compilationUnits)).toEqual(jasmine.arrayContaining(
                    [ccc + '/some/parts/' + ccc + '/.', 'some/unit']));
            });

            it('normalize variables in compilationUnits\' sources', function () {
                expect(normalizedConfig.compilationUnits[cu1].sources).toBeDefined();
                expect(normalizedConfig.compilationUnits[cu1].sources).not.toBeNull();
                expect(normalizedConfig.compilationUnits[cu1].sources.length).toBe(3);
                expect(normalizedConfig.compilationUnits[cu1].sources).toEqual(jasmine.arrayContaining(
                    ['someFile.js', path.join(ccc, 'some', 'file.js'), path.join('some', 'file.js')]));
            });

            it('normalize variables in compilationUnits\' externs', function () {
                expect(normalizedConfig.compilationUnits[cu1].externs).toBeDefined();
                expect(normalizedConfig.compilationUnits[cu1].externs).not.toBeNull();
                expect(normalizedConfig.compilationUnits[cu1].externs.length).toBe(3);
                expect(normalizedConfig.compilationUnits[cu1].externs).toEqual(jasmine.arrayContaining(
                    ['someFile.js', path.join(ccc, 'some', 'file.js'), path.join('some', 'file.js')]));
            });

            it('normalize variables in compilationUnits\' buildOptions', function () {
                expect(normalizedConfig.compilationUnits[cu1].buildOptions).toBeDefined();
                expect(normalizedConfig.compilationUnits[cu1].buildOptions).not.toBeNull();
                expect(normalizedConfig.compilationUnits[cu1].buildOptions.length).toBe(3);
                expect(normalizedConfig.compilationUnits[cu1].buildOptions).toEqual(jasmine.arrayContaining(
                    ['--version', '--flagfile', '.' + path.sep + 'flagfile.closure_compiler']));
            });

            it('normalize variables in next\'s keys', function () {
                expect(normalizedConfig.next).toBeDefined();
                expect(normalizedConfig.next).not.toBe(null);
                expect(Object.keys(normalizedConfig.next).length).toBe(2);
                expect(Object.keys(normalizedConfig.next)).toEqual(jasmine.arrayContaining([
                    path.resolve(process.cwd(), path.join(ccc, 'some', 'other', ccc, 'folders')),
                    path.join(process.cwd(), 'some', 'path')
                ]));
            });

            it('throws an exception in case of undefined variable', function () {
                var config = {
                    sources: ['${doesNotExist}/abc.def']
                };
                var cn = new ConfigurationNormalizer(config, null, vm);
                expect(function () {
                    cn.normalize();
                }).toThrowError();
            });

            it('normalize variables in outputFile', function () {
                expect(normalizedConfig).toBeDefined();
                expect(normalizedConfig.compilationUnits['some/unit'].outputFile).toBeDefined();
                expect(normalizedConfig.compilationUnits['some/unit'].outputFile).toEqual(jasmine.any(String));
                expect(normalizedConfig.compilationUnits['some/unit'].outputFile).toBe(path.join('abc', 'def.ghi'));
            });
        });

        describe('with absolute paths', function () {
            var cu1 = CC.compiler.CONTRIB_PATH + '/some/parts/' + CC.compiler.CONTRIB_PATH + '/' + process.cwd();

            beforeEach(function () {
                vm = new VariableManager();
                vm.set('CONTRIB_PATH', CC.compiler.CONTRIB_PATH);
                vm.set('CWD', process.cwd());
                cn = new ConfigurationNormalizer(config, null, vm, true);
                normalizedConfig = cn.normalize();
            });

            it('normalize variables in checkFs.check', function () {
                expect(normalizedConfig.checkFs).toBeDefined();
                expect(normalizedConfig.checkFs).not.toBeNull();
                expect(normalizedConfig.checkFs.check).toBeDefined();
                expect(normalizedConfig.checkFs.check).not.toBeNull();
                expect(normalizedConfig.checkFs.check.length).toBe(2);
                expect(normalizedConfig.checkFs.check).toEqual(jasmine.arrayContaining([process.cwd(),
                                                                                        CC.compiler.CONTRIB_PATH]));
            });

            it('normalize variables in checkFs.ignore', function () {
                expect(normalizedConfig.checkFs.ignore).toBeDefined();
                expect(normalizedConfig.checkFs.ignore).not.toBeNull();
                expect(normalizedConfig.checkFs.ignore.length).toBe(2);
                expect(normalizedConfig.checkFs.ignore).toEqual(jasmine.arrayContaining([process.cwd(),
                                                                                         CC.compiler.CONTRIB_PATH]));
            });

            it('normalize variables in checkFs.fileExtensions', function () {
                expect(normalizedConfig.checkFs.fileExtensions).toBeDefined();
                expect(normalizedConfig.checkFs.fileExtensions).not.toBeNull();
                expect(normalizedConfig.checkFs.fileExtensions.length).toBe(1);
                expect(normalizedConfig.checkFs.fileExtensions).toEqual([CC.compiler.CONTRIB_PATH]);
            });

            it('normalize variables in global sources', function () {
                expect(normalizedConfig.sources).toBeDefined();
                expect(normalizedConfig.sources).not.toBeNull();
                expect(normalizedConfig.sources.length).toBe(3);
                expect(normalizedConfig.sources).toEqual(jasmine.arrayContaining([
                    path.resolve('someFile.js'),
                    path.join(CC.compiler.CONTRIB_PATH, process.cwd(), 'some', 'file.js'),
                    path.resolve('some', 'file.js')
                ]));
            });

            it('normalize variables in global externs', function () {
                expect(normalizedConfig.externs).toBeDefined();
                expect(normalizedConfig.externs).not.toBeNull();
                expect(normalizedConfig.externs.length).toBe(3);
                expect(normalizedConfig.externs).toEqual(jasmine.arrayContaining([
                    path.resolve('someFile.js'),
                    path.join(CC.compiler.CONTRIB_PATH, process.cwd(), 'some', 'file.js'),
                    path.resolve('some', 'file.js')
                ]));
            });

            it('normalize variables in global buildOptions', function () {
                expect(normalizedConfig.buildOptions).toBeDefined();
                expect(normalizedConfig.buildOptions).not.toBeNull();
                expect(normalizedConfig.buildOptions.length).toBe(3);
                expect(normalizedConfig.buildOptions).toEqual(jasmine.arrayContaining([
                    '--version',
                    '--flagfile',
                    path.join(CC.compiler.CONTRIB_PATH, 'flagfile.closure_compiler')
                ]));
            });

            it('normalize variables in compilationUnits\' keys', function () {
                expect(normalizedConfig.compilationUnits).toBeDefined();
                expect(normalizedConfig.compilationUnits).not.toBeNull();
                expect(Object.keys(normalizedConfig.compilationUnits).length).toBe(2);
                expect(Object.keys(normalizedConfig.compilationUnits)).toEqual(jasmine.arrayContaining([
                    CC.compiler.CONTRIB_PATH + '/some/parts/' + CC.compiler.CONTRIB_PATH + '/' + process.cwd(),
                    'some/unit'
                ]));
            });

            it('normalize variables in compilationUnits\' sources', function () {
                expect(normalizedConfig.compilationUnits[cu1].sources).toBeDefined();
                expect(normalizedConfig.compilationUnits[cu1].sources).not.toBeNull();
                expect(normalizedConfig.compilationUnits[cu1].sources.length).toBe(3);
                expect(normalizedConfig.compilationUnits[cu1].sources).toEqual(jasmine.arrayContaining([
                    path.resolve('someFile.js'),
                    path.join(CC.compiler.CONTRIB_PATH, process.cwd(), 'some', 'file.js'),
                    path.resolve('some', 'file.js')
                ]));
            });

            it('normalize variables in compilationUnits\' externs', function () {
                expect(normalizedConfig.compilationUnits[cu1].externs).toBeDefined();
                expect(normalizedConfig.compilationUnits[cu1].externs).not.toBeNull();
                expect(normalizedConfig.compilationUnits[cu1].externs.length).toBe(3);
                expect(normalizedConfig.compilationUnits[cu1].externs).toEqual(jasmine.arrayContaining([
                    path.resolve('someFile.js'),
                    path.join(CC.compiler.CONTRIB_PATH, process.cwd(), 'some', 'file.js'),
                    path.resolve('some', 'file.js')
                ]));
            });

            it('normalize variables in compilationUnits\' buildOptions', function () {
                expect(normalizedConfig.compilationUnits[cu1].buildOptions).toBeDefined();
                expect(normalizedConfig.compilationUnits[cu1].buildOptions).not.toBeNull();
                expect(normalizedConfig.compilationUnits[cu1].buildOptions.length).toBe(3);
                expect(normalizedConfig.compilationUnits[cu1].buildOptions).toEqual(jasmine.arrayContaining([
                    '--version',
                    '--flagfile',
                    path.resolve('flagfile.closure_compiler')
                ]));
            });

            it('normalize variables in next\'s keys', function () {
                expect(normalizedConfig.next).toBeDefined();
                expect(normalizedConfig.next).not.toBe(null);
                expect(Object.keys(normalizedConfig.next).length).toBe(2);
                expect(Object.keys(normalizedConfig.next)).toEqual(jasmine.arrayContaining([
                    path.join(CC.compiler.CONTRIB_PATH, 'some', 'other', CC.compiler.CONTRIB_PATH, 'folders',
                              process.cwd()),
                    path.resolve('some', 'path')
                ]));
            });

            it('throws an exception in case of undefined variable', function () {
                var config = {
                    sources: ['${doesNotExist}/abc.def']
                };
                var cn = new ConfigurationNormalizer(config, null, vm);
                expect(function () {
                    cn.normalize();
                }).toThrowError();
            });

            it('normalize variables in outputFile', function () {
                expect(normalizedConfig).toBeDefined();
                expect(normalizedConfig.compilationUnits['some/unit'].outputFile).toBeDefined();
                expect(normalizedConfig.compilationUnits['some/unit'].outputFile).toEqual(jasmine.any(String));
                expect(normalizedConfig.compilationUnits['some/unit'].outputFile).toBe(path.resolve(path.join('abc', 'def.ghi')));
            });
        });
    });
});
