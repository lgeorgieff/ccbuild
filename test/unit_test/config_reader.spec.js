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

var configReader = require('../../src/config_reader');

/**
 * @ignore
 * @const
 */
var EMPTY_CONFIG = {sources: [], externs: [], buildOptions: [], compilationUnits: {}, next: {}};

describe('ConfigurationNormalizer', function () {
    it('normalize undefined', function () {
        var configNormalizer = new configReader.ConfigurationNormalizer();
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(EMPTY_CONFIG);
    });

    it('normalize null', function () {
        var configNormalizer = new configReader.ConfigurationNormalizer(null);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(EMPTY_CONFIG);
    });

    it('normalize empty object', function () {
        var configNormalizer = new configReader.ConfigurationNormalizer({});
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(EMPTY_CONFIG);
    });

    it('normalize sources', function () {
        var config = {sources: ['abc', 'def', '']};
        var configNormalizer = new configReader.ConfigurationNormalizer(config, __dirname);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toBeDefined();
        expect(normalizedConfig.sources).toBeDefined();
        expect(normalizedConfig.sources.length).toBe(3);
        expect(normalizedConfig.sources).toContain(path.resolve(__dirname, 'abc'));
        expect(normalizedConfig.sources).toContain(path.resolve(__dirname, 'def'));
        expect(normalizedConfig.sources).toContain(path.resolve(__dirname, ''));
        expect(normalizedConfig.externs).toEqual([]);
        expect(normalizedConfig.buildOptions).toEqual([]);
        expect(normalizedConfig.compilationUnits).toEqual({});
        expect(normalizedConfig.next).toEqual({});
    });

    it('normalize undefined sources', function () {
        var config = {sources: undefined};
        var configNormalizer = new configReader.ConfigurationNormalizer(config, __dirname);
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
        var configNormalizer = new configReader.ConfigurationNormalizer(config, __dirname);
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
        var configNormalizer = new configReader.ConfigurationNormalizer(config, __dirname);
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
        var configNormalizer = new configReader.ConfigurationNormalizer(config, __dirname);
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
        var configNormalizer = new configReader.ConfigurationNormalizer(config, __dirname);
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

        var configNormalizer = new configReader.ConfigurationNormalizer(config, __dirname);
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
        var configNormalizer = new configReader.ConfigurationNormalizer(config, __dirname);
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
        var configNormalizer = new configReader.ConfigurationNormalizer({externs: {}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({externs: [{}]});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({externs: [12]});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({externs: ['abc', 12, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({externs: ['abc', undefined, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({externs: ['abc', null, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));
    });

    it('normalize invalid sources', function () {
        var configNormalizer = new configReader.ConfigurationNormalizer({sources: {}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({sources: [{}]});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({sources: [12]});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({sources: ['abc', 12, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({sources: ['abc', undefined, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({sources: ['abc', null, 'def']});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));
    });

    it('normalize invalid buildOptions', function () {
        var configNormalizer = new configReader.ConfigurationNormalizer({buildOptions: {compilation_level: undefined}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({buildOptions: {compilation_level: null}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({buildOptions: {compilation_level: 2}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({buildOptions: {compilation_level: {}}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({buildOptions: {compilation_level: [1]}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({buildOptions: {compilation_level: [undefined]}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));

        configNormalizer = new configReader.ConfigurationNormalizer({buildOptions: {compilation_level: [null]}});
        expect(configNormalizer.normalize.bind(configNormalizer)).toThrow(jasmine.any(Error));
    });

    it('getLocalConfigFiles', function (done) {
        var configFilePaths = ['.nbuild', 'nbuild.nbuild', 'config.nbuild', 'config', 'nbuild', 'conig.nbuildx',
                               'conig.build'];
        var loadedConfigFilePaths = ['.nbuild', 'nbuild.nbuild', 'config.nbuild']
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

        createConfigs(process.cwd());
        createConfigs(testDirectory);

        configReader.getLocalConfigFiles().then(function (configFilePaths) {
            expect(configFilePaths.length).toBe(loadedConfigFilePaths.length);
            expect(configFilePaths).toEqual(jasmine.arrayContaining(loadedConfigFilePaths));
            done();
        }).catch(function (err) {
            done.fail(err);
        }).done(function () {
            configFilePaths.forEach(function (filePath) {
                fs.unlinkSync(filePath);
            });
            configFilePaths.forEach(function (filePath) {
                fs.unlinkSync(path.join(testDirectory, filePath));
            });
            fs.rmdirSync(testDirectory);
        });
    });

    it('normalize build options with = characters', function () {
        var config = Object.assign({}, EMPTY_CONFIG);
        config.buildOptions = [
            '--js=file1.js',
            '--js=file2.js',
            '--js', 'file3.js'
        ];
        var configNormalizer = new configReader.ConfigurationNormalizer(config);
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
        configNormalizer = new configReader.ConfigurationNormalizer(config);
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
        configNormalizer = new configReader.ConfigurationNormalizer(config);
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
        configNormalizer = new configReader.ConfigurationNormalizer(config);
        normalizedConfiguration = configNormalizer.normalize();
        expect(normalizedConfiguration.buildOptions).toBeDefined();
        expect(normalizedConfiguration.buildOptions).toEqual(jasmine.any(Array));
        expect(normalizedConfiguration.buildOptions.length).toBe(18);
        expect(normalizedConfiguration.buildOptions)
            .toEqual(['--js', 'file1.js', '--js', 'file2.js', '--js', 'file3.js', '--externs', 'externs1.js',
                      '--externs', 'externs1.js', '--externs', 'externs2.js', '--js', 'fil=e4.js', '--js', 'fil=e4.js=',
                      '--js', '']);
    });

    xit('merge buildOptions', function () {});

    xit('load default configuration', function () {});

    xit('load configuration', function () {});

    xit('load multiple configurattions', function () {});

    xit('load configuration hierarchy', function () {});

    xit('load circular configuration hierarchy', function () {});
});
