'use strict';

/**
 * @suppress {duplicate}
 */
var path = require('path');

var configReader = require('../../src/config_reader');

const EMPTY_CONFIG = {sources: [], externs: [], buildOptions: [], compilationUnits: {}, next: {}};

describe('ConfigurationNormalizer', () => {
    it('normalize undefined', () => {
        var configNormalizer = new configReader.ConfigurationNormalizer();
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(EMPTY_CONFIG);
    });

    it('normalize null', () => {
        var configNormalizer = new configReader.ConfigurationNormalizer(null);
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(EMPTY_CONFIG);
    });

    it('normalize empty object', () => {
        var configNormalizer = new configReader.ConfigurationNormalizer({});
        var normalizedConfig = configNormalizer.normalize();
        expect(normalizedConfig).toEqual(EMPTY_CONFIG);
    });

    it('normalize sources', () => {
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

    it('normalize undefined sources', () => {
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

    it('normalize null sources', () => {
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

    it('normalize externs', () => {
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

    it('normalize undefined externs', () => {
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

    it('normalize null externs', () => {
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

    it('normalize buildOptions object', () => {
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

    it('normalize buildOptions array', () => {
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

    it('normalize invalid externs', () => {
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

    it('normalize invalid sources', () => {
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

    it('normalize invalid buildOptions', () => {
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

    xit('merge buildOptions', () => {});

    xit('load default configuration', () => {});

    xit('load configuration', () => {});

    xit('load multiple configurattions', () => {});

    xit('load configuration hierarchy', () => {});
});
