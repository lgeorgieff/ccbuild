'use strict';

var utils = require('../../src/utils');

describe('array functions', function () {
    it('arrayToSet', function () {
        var comp1 = function (lft, rgt) {
            return lft === rgt;
        };
        var comp2 = function (lft, rgt) {
            return lft == rgt;
        };
        expect(utils.arrayToSet([])).toEqual([]);
        expect(utils.arrayToSet([1, 2, 3])).toEqual([1, 2, 3]);
        expect(utils.arrayToSet([1, 2, 3, 2, 4, 5, 8, 1, 6, 6, 7, 1])).toEqual([1, 2, 3, 4, 5, 8, 6, 7]);
        expect(utils.arrayToSet([1, 2, 3, '2', 8, 1, '6', 7, 1, 6])).toEqual([1, 2, 3, '2', 8, '6', 7, 6]);

        expect(utils.arrayToSet([], comp1)).toEqual([]);
        expect(utils.arrayToSet([1, 2, 3], comp1)).toEqual([1, 2, 3]);
        expect(utils.arrayToSet([1, 2, 3, 2, 4, 5, 8, 1, 6, 6, 7, 1], comp1)).toEqual([1, 2, 3, 4, 5, 8, 6, 7]);
        expect(utils.arrayToSet([1, 2, 3, '2', 8, 1, '6', 7, 1, 6], comp1)).toEqual([1, 2, 3, '2', 8, '6', 7, 6]);

        expect(utils.arrayToSet([], comp2)).toEqual([]);
        expect(utils.arrayToSet([1, 2, 3], comp2)).toEqual([1, 2, 3]);
        expect(utils.arrayToSet([1, 2, 3, 2, 4, 5, 8, 1, 6, 6, 7, 1], comp2)).toEqual([1, 2, 3, 4, 5, 8, 6, 7]);
        expect(utils.arrayToSet([1, 2, 3, '2', 8, 1, '6', 7, 1, 6], comp2)).toEqual([1, 2, 3, 8, '6', 7]);
    });

    it('mergeStringArrays', function () {
        var comp1 = function (lft, rgt) {
            return lft === rgt;
        };
        var comp2 = function (lft, rgt) {
            return lft == rgt;
        };
        expect(utils.mergeArrays()).toEqual([]);
        expect(utils.mergeArrays(comp1)).toEqual([]);
        expect(utils.mergeArrays([], comp1)).toEqual([]);
        expect(utils.mergeArrays([], [], comp1)).toEqual([]);
        expect(utils.mergeArrays([])).toEqual([]);
        expect(utils.mergeArrays([], [])).toEqual([]);

        expect(utils.mergeArrays([1, 2, 3])).toEqual([1, 2, 3]);
        expect(utils.mergeArrays([1, 2, 3, 2, 2, 4, 3])).toEqual([1, 2, 3, 4]);
        expect(utils.mergeArrays([1, 2, 3, '2', 2, 4, 3])).toEqual([1, 2, 3, '2', 4]);
        expect(utils.mergeArrays([1, 2, 3], comp1)).toEqual([1, 2, 3]);
        expect(utils.mergeArrays([1, 2, 3, 2, 2, 4, 3], comp1)).toEqual([1, 2, 3, 4]);
        expect(utils.mergeArrays([1, 2, 3, '2', 2, 4, 3], comp1)).toEqual([1, 2, 3, '2', 4]);
        expect(utils.mergeArrays([1, 2, 3], comp2)).toEqual([1, 2, 3]);
        expect(utils.mergeArrays([1, 2, 3, 2, 2, 4, 3], comp2)).toEqual([1, 2, 3, 4]);
        expect(utils.mergeArrays([1, 2, 3, '2', 2, 4, 3], comp2)).toEqual([1, 2, 3, 4]);

        expect(utils.mergeArrays([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
        expect(utils.mergeArrays([1, 2, 3, 2, 2, 4, 3], [4, 5, 6, 4, 7])).toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect(utils.mergeArrays([1, 2, 3, '2', 2, 4, 3], ['4', 2, 5, '2'])).toEqual([1, 2, 3, '2', 4, '4', 5]);
        expect(utils.mergeArrays([1, 2, 3], [4, 5, 6], comp1)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(utils.mergeArrays([1, 2, 3, 2, 2, 4, 3], [4, 5, 6, 4, 7], comp1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect(utils.mergeArrays([1, 2, 3, '2', 2, 4, 3], ['4', 2, 5, '2'], comp1)).toEqual([1, 2, 3, '2', 4, '4', 5]);
        expect(utils.mergeArrays([1, 2, 3], [4, 5, 6], comp2)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(utils.mergeArrays([1, 2, 3, 2, 2, 4, 3], [4, 5, 6, 4, 7], comp2)).toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect(utils.mergeArrays([1, 2, 3, '2', 2, 4, 3], ['4', 2, 5, '2'], comp2)).toEqual([1, 2, 3, 4, 5]);
    });

    it('getValuesFromArgumentsArray', function () {
        var argumentsArray = ['--debug', '--js', 'file1.js', '--js', 'file2.js', '--transform_amd_modules', '--externs',
                              'extern1.js', '--use_types_for_optimization', '--externs', 'extern2.js', '--version',
                              '--js', 'js.js', '--externs'];
        expect(utils.getValuesFromArgumentsArray(null, '--js')).toEqual([]);
        expect(utils.getValuesFromArgumentsArray([], '--js')).toEqual([]);
        expect(utils.getValuesFromArgumentsArray(argumentsArray, '--doesNotExist')).toEqual([]);
        expect(utils.getValuesFromArgumentsArray(argumentsArray, '--js')).toEqual(['file1.js', 'file2.js', 'js.js']);
        expect(utils.getValuesFromArgumentsArray(argumentsArray, '--version')).toEqual(['--js']);
        expect(utils.getValuesFromArgumentsArray(argumentsArray, '--externs')).toEqual(['extern1.js', 'extern2.js']);
    });

    it('removeArgumentsFromArgumentsArray', function () {
        var argumentsArray = ['--debug', '--js', 'file1.js', '--js', 'file2.js', '--transform_amd_modules', '--externs',
                              'extern1.js', '--use_types_for_optimization', '--externs', 'extern2.js', '--version',
                              '--js', 'js.js', '--externs'];
        expect(utils.removeArgumentsFromArgumentsArray(null, null)).toEqual([]);
        expect(utils.removeArgumentsFromArgumentsArray(argumentsArray, null)).toEqual(argumentsArray);
        expect(utils.removeArgumentsFromArgumentsArray(argumentsArray, [])).toEqual(argumentsArray);
        expect(utils.removeArgumentsFromArgumentsArray(argumentsArray, [{}, {}])).toEqual(argumentsArray);
        expect(utils.removeArgumentsFromArgumentsArray(null, [])).toEqual([]);
        expect(utils.removeArgumentsFromArgumentsArray(null, [{}, {}])).toEqual([]);

        var expectedValue = argumentsArray.slice(0);
        expectedValue.splice(expectedValue.indexOf('--version'), 1);
        expect(utils.removeArgumentsFromArgumentsArray(argumentsArray, [{name: '--version'}]))
            .toEqual(expectedValue);
        expect(utils.removeArgumentsFromArgumentsArray(argumentsArray, [{name: '--version'}, {}]))
            .toEqual(expectedValue);
        expect(utils.removeArgumentsFromArgumentsArray(argumentsArray, [{name: '--version', hasValue: false}]))
            .toEqual(expectedValue);
        expect(utils.removeArgumentsFromArgumentsArray(
            argumentsArray, [{name: '--version', hasValue: false}, {hasValue: true}])).toEqual(expectedValue);
        expectedValue = argumentsArray.slice(0);
        expectedValue.splice(expectedValue.indexOf('--version'), 2);
        expect(utils.removeArgumentsFromArgumentsArray(argumentsArray, [{name: '--version', hasValue: true}]))
            .toEqual(expectedValue);
        expectedValue = argumentsArray.slice(0);
        expectedValue.splice(expectedValue.indexOf('--version'), 1);
        expectedValue.splice(expectedValue.indexOf('--debug'), 1);
        expectedValue.splice(expectedValue.indexOf('--transform_amd_modules'), 1);
        expect(utils.removeArgumentsFromArgumentsArray(
            argumentsArray, [{name: '--version'}, {name: '--debug'}, {name: '--transform_amd_modules'}]))
            .toEqual(expectedValue);
        expect(utils.removeArgumentsFromArgumentsArray(
            argumentsArray, [{name: '--version'}, {name: 'xyz'}, {name: '--debug'}, {name: '--transform_amd_modules'}]))
            .toEqual(expectedValue);
        expect(utils.removeArgumentsFromArgumentsArray(
            argumentsArray, [{name: '--js'}, {name: '--externs'}, {name: '--debug'}, {name: '--transform_amd_modules'},
                             {name: '--debug'}, {name: '--use_types_for_optimization'}]))
            .toEqual(['file1.js', 'file2.js', 'extern1.js', 'extern2.js', '--version', 'js.js']);
        expect(utils.removeArgumentsFromArgumentsArray(
            argumentsArray, [{name: '--js', hasValue: true}, {name: '--externs', hasValue: true}, {name: '--debug'}]))
            .toEqual(['--transform_amd_modules', '--use_types_for_optimization', '--version']);
    });

    it('valuesToArgumentsArray', function () {
        expect(utils.valuesToArgumentsArray([], '--debug')).toEqual(['--debug']);
        expect(utils.valuesToArgumentsArray(['file1.js'], '--js')).toEqual(['--js', 'file1.js']);
        expect(utils.valuesToArgumentsArray(['file1.js', 'file2.js', 'file3.js'], '--js'))
            .toEqual(['--js', 'file1.js', '--js', 'file2.js', '--js', 'file3.js']);
    });

    it('findTuple', function () {
        var comp1 = function (lft, rgt) {
            return lft === rgt;
        };
        var comp2 = function (lft, rgt) {
            return lft == rgt;
        };

        expect(utils.findTuple(null, {fst: 1, snd: 2})).toBe(-1);
        expect(utils.findTuple([], {fst: 1, snd: 2})).toBe(-1);
        expect(utils.findTuple([1], {fst: 1, snd: 2})).toBe(-1);
        expect(utils.findTuple([1, 3], {fst: 1, snd: 2})).toBe(-1);
        expect(utils.findTuple([1, 2, 3], {fst: 1, snd: 2})).toBe(0);
        expect(utils.findTuple([1, 2, 3, 1, 2], {fst: 1, snd: 2})).toBe(0);
        expect(utils.findTuple([1, 3, 2], {fst: 1, snd: 2})).toBe(-1);
        expect(utils.findTuple([1, 1, 2], {fst: 1, snd: 2})).toBe(1);
        expect(utils.findTuple([0, 3, 4, 1, 3, 1, 1, 2], {fst: 1, snd: 2})).toBe(6);
        expect(utils.findTuple([0, 3, 4, 1, 3, 1, '1', 2], {fst: 1, snd: 2})).toBe(-1);

        expect(utils.findTuple(null, {fst: 1, snd: 2}, comp1)).toBe(-1);
        expect(utils.findTuple([], {fst: 1, snd: 2}, comp1)).toBe(-1);
        expect(utils.findTuple([1], {fst: 1, snd: 2}, comp1)).toBe(-1);
        expect(utils.findTuple([1, 3], {fst: 1, snd: 2}, comp1)).toBe(-1);
        expect(utils.findTuple([1, 2, 3], {fst: 1, snd: 2}, comp1)).toBe(0);
        expect(utils.findTuple([1, 2, 3, 1, 2], {fst: 1, snd: 2}, comp1)).toBe(0);
        expect(utils.findTuple([1, 3, 2], {fst: 1, snd: 2}, comp1)).toBe(-1);
        expect(utils.findTuple([1, 1, 2], {fst: 1, snd: 2}, comp1)).toBe(1);
        expect(utils.findTuple([0, 3, 4, 1, 3, 1, 1, 2], {fst: 1, snd: 2}, comp1)).toBe(6);
        expect(utils.findTuple([0, 3, 4, 1, 3, 1, '1', 2], {fst: 1, snd: 2}, comp1)).toBe(-1);

        expect(utils.findTuple(null, {fst: 1, snd: 2}, comp2)).toBe(-1);
        expect(utils.findTuple([], {fst: 1, snd: 2}, comp2)).toBe(-1);
        expect(utils.findTuple([1], {fst: 1, snd: 2}, comp2)).toBe(-1);
        expect(utils.findTuple([1, 3], {fst: 1, snd: 2}, comp2)).toBe(-1);
        expect(utils.findTuple([1, 2, 3], {fst: 1, snd: 2}, comp2)).toBe(0);
        expect(utils.findTuple([1, 2, 3, 1, 2], {fst: 1, snd: 2}, comp2)).toBe(0);
        expect(utils.findTuple([1, 3, 2], {fst: 1, snd: 2}, comp2)).toBe(-1);
        expect(utils.findTuple([1, 1, 2], {fst: 1, snd: 2}, comp2)).toBe(1);
        expect(utils.findTuple([0, 3, 4, 1, 3, 1, 1, 2], {fst: 1, snd: 2}, comp2)).toBe(6);
        expect(utils.findTuple([0, 3, 4, 1, 3, 1, '1', 2], {fst: 1, snd: 2}, comp2)).toBe(6);
    });

    it('mergeArguments', function () {
        expect(utils.mergeArguments()).toEqual([]);
        expect(utils.mergeArguments(null)).toEqual([]);
        expect(utils.mergeArguments(null, null)).toEqual([]);
        expect(utils.mergeArguments([], null)).toEqual([]);
        expect(utils.mergeArguments([])).toEqual([]);
        expect(utils.mergeArguments(null, [])).toEqual([]);
        expect(utils.mergeArguments(['--version'], null)).toEqual(['--version']);
        expect(utils.mergeArguments(['--version'])).toEqual(['--version']);
        expect(utils.mergeArguments(null, ['--version'])).toEqual(['--version']);
        expect(utils.mergeArguments(['--version', '--debug'], null)).toEqual(['--version', '--debug']);
        expect(utils.mergeArguments(['--version', '--debug'])).toEqual(['--version', '--debug']);
        expect(utils.mergeArguments(null, ['--version', '--debug'])).toEqual(['--version', '--debug']);

        var args1 = ['--version', '--debug'];
        var args2 = ['--transform_amd_modules', '--use_types_for_optimization'];
        var args3 = ['--version', '--debug', '--transform_amd_modules', '--use_types_for_optimization'];
        expect(utils.mergeArguments(args1, args2)).toEqual(args3);
        args2 = ['--transform_amd_modules', '--debug', '--debug', '--version', '--use_types_for_optimization'];
        args3 = ['--version', '--debug', '--transform_amd_modules', '--use_types_for_optimization'];
        expect(utils.mergeArguments(args1, args2)).toEqual(args3);
        args1 = ['--version', '--debug', '--js', 'file1.js', '--js', 'file2.js'];
        args2 = ['--transform_amd_modules', '--debug', '--debug', '--js', 'file2.js', '--version',
                 '--use_types_for_optimization', '--js', 'file3.js'];
        args3 = ['--version', '--debug', '--js', 'file1.js', '--js', 'file2.js', '--transform_amd_modules',
                 '--use_types_for_optimization', '--js', 'file3.js'];
        expect(utils.mergeArguments(args1, args2)).toEqual(args3);
        args1 = ['--version', '--externs', 'extern1.js', '--debug', '--js', 'file1.js', '--js', 'file2.js'];
        args2 = ['--transform_amd_modules', '--debug', '--debug', '--js', 'file2.js', '--version', '--externs',
                 'extern2.js', '--use_types_for_optimization', '--externs', 'extern1.js', '--js', 'file3.js'];
        args3 = ['--version', '--externs', 'extern1.js', '--debug', '--js', 'file1.js', '--js', 'file2.js',
                 '--transform_amd_modules', '--externs', 'extern2.js', '--use_types_for_optimization', '--js',
                 'file3.js'];
        expect(utils.mergeArguments(args1, args2)).toEqual(args3);
        args1 = ['--version', '--externs', 'file1.js', '--debug', '--js', 'file1.js', '--js', 'file2.js'];
        args2 = ['--transform_amd_modules', '--debug', '--debug', '--js', 'file2.js', '--version', '--externs',
                 'extern2.js', '--use_types_for_optimization', '--externs', 'file1.js', '--js', 'file3.js'];
        args3 = ['--version', '--externs', 'file1.js', '--debug', '--js', 'file1.js', '--js', 'file2.js',
                 '--transform_amd_modules', '--externs', 'extern2.js', '--use_types_for_optimization', '--js',
                 'file3.js'];
        expect(utils.mergeArguments(args1, args2)).toEqual(args3);
        args2 = ['--transform_amd_modules', '--debug', '--debug', '--js', 'file2.js', '--version', '--externs',
                 'extern2.js', '--use_types_for_optimization', '--externs', 'extern1.js', '--js', 'file3.js'];
        args3 = ['--version', '--externs', 'file1.js', '--debug', '--js', 'file1.js', '--js', 'file2.js',
                 '--transform_amd_modules', '--externs', 'extern2.js', '--use_types_for_optimization', '--externs',
                 'extern1.js', '--js', 'file3.js'];
        expect(utils.mergeArguments(args1, args2)).toEqual(args3);
    });
});
