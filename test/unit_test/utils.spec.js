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

    it('arrayContains', function () {
        expect(utils.arrayContains(null, 1)).toBe(false);
        expect(utils.arrayContains([], 1)).toBe(false);
        expect(utils.arrayContains(['1'], 1)).toBe(false);
        expect(utils.arrayContains([0, 1, 2, 3], 4)).toBe(false);
        expect(utils.arrayContains([0, 1, 2, 3, 4], 4)).toBe(true);
        expect(utils.arrayContains([0, 1, 2, 3, 4])).toBe(false);
    });
});

describe('utils\' isX', function () {
    var relativePathToDir = path.join('relative', 'path', 'to', 'dir');
    var relativePathToDirMock = 'relative/path/to/dir';
    var relativePathToFile = path.join('relative', 'path', 'to', 'file.txt');
    var relativePathToFileMock = 'relative/path/to/file.txt';
    var absolutePathToDir;
    var absolutePathToDirMock;
    var absolutePathToFile;
    var absolutePathToFileMock;
    if (process.platform === 'win32') {
        absolutePathToDir = path.join('c:' + 'absolute', 'path', 'to', 'dir');
        absolutePathToDirMock = 'c:/absolute/path/to/dir';
        absolutePathToFile = path.join('c:' + 'absolute', 'path', 'to', 'file.txt');
        absolutePathToFileMock = 'c:/absolute/path/to/file.txt';
    } else {
        absolutePathToDir = path.join(path.sep + 'absolute', 'path', 'to', 'dir');
        absolutePathToDirMock = '/absolute/path/to/dir';
        absolutePathToFile = path.join(path.sep + 'absolute', 'path', 'to', 'file.txt');
        absolutePathToFileMock = '/absolute/path/to/file.txt';
    }
    var pathToSymlinkToFile = path.join('relative', 'path', 'to', 'symlink', 'file');
    var pathToSymlinkToFileMock = 'relative/path/to/symlink/file';
    var pathToSymlinkToDir = path.join('relative', 'path', 'to', 'symlink', 'folder');
    var pathToSymlinkToDirMock = 'relative/path/to/symlink/folder';
    var pathToBrokenSymlink = path.join('relative', 'path', 'to', 'symlink', 'broken');
    var pathToBrokenSymlinkMock = 'relative/path/to/symlink/broken';

    beforeAll(function () {
        var fakeFs = {};
        fakeFs[relativePathToDirMock] = {};
        fakeFs[relativePathToFileMock] = 'some text';
        fakeFs[absolutePathToDirMock] = {};
        fakeFs[absolutePathToFileMock] = 'some text';
        fakeFs[pathToSymlinkToFileMock] = mockFs.symlink({path: '../../../../' + relativePathToFileMock});
        fakeFs[pathToSymlinkToDirMock] = mockFs.symlink({path: '../../../../' + relativePathToDirMock});
        fakeFs[pathToBrokenSymlinkMock] = mockFs.symlink({path: 'does/not/exist'});
        mockFs(fakeFs);
    });

    afterAll(mockFs.restore);

    describe('utils.isFile', function () {
        it('returns false for relative directory path', function (done) {
            utils.isFile(relativePathToDir).then(function (value) {
                expect(value).toBe(false);
                done();
            }).catch(fail);
        });

        it('returns true for relative file path', function (done) {
            utils.isFile(relativePathToFile).then(function (value) {
                expect(value).toBe(true);
                done();
            }).catch(fail);
        });

        it('returns false for absolute directory path', function (done) {
            utils.isFile(absolutePathToDir).then(function (value) {
                expect(value).toBe(false);
                done();
            }).catch(fail);
        });

        it('returns true for relative absolute path', function (done) {
            utils.isFile(absolutePathToFile).then(function (value) {
                expect(value).toBe(true);
                done();
            }).catch(fail);
        });

        it('returns false if path does not exist', function (done) {
            utils.isFile(path.join('path', 'does', 'not', 'exist'))
                .then(function (value) {
                    expect(value).toBe(false);
                    done();
                });
        });

        it('returns false for symlink to folder', function (done) {
            utils.isFile(pathToSymlinkToDir).then(function (value) {
                expect(value).toBe(false);
                done();
            }).catch(fail);
        });

        it('returns true for symlink to file', function (done) {
            utils.isFile(pathToSymlinkToFile).then(function (value) {
                expect(value).toBe(true);
                done();
            }).catch(fail);
        });

        it('broken symlink returns false', function (done) {
            utils.isFile(pathToBrokenSymlink)
                .then(function (value) {
                    expect(value).toBe(false);
                    done();
                });
        });
    });

    describe('utils.isDirectory', function () {
        it('returns true for relative directory path', function (done) {
            utils.isDirectory(relativePathToDir).then(function (value) {
                expect(value).toBe(true);
                done();
            }).catch(fail);
        });

        it('returns false for relative file path', function (done) {
            utils.isDirectory(relativePathToFile).then(function (value) {
                expect(value).toBe(false);
                done();
            }).catch(fail);
        });

        it('returns true for absolute directory path', function (done) {
            utils.isDirectory(absolutePathToDir).then(function (value) {
                expect(value).toBe(true);
                done();
            }).catch(fail);
        });

        it('returns false for absolute file path', function (done) {
            utils.isDirectory(absolutePathToFile).then(function (value) {
                expect(value).toBe(false);
                done();
            }).catch(fail);
        });

        it('returns false if path does not exist', function (done) {
            utils.isDirectory(path.join('path', 'does', 'not', 'exist'))
                .then(function (value) {
                    expect(value).toBe(false);
                    done();
                });
        });

        it('returns true for symlink to folder', function (done) {
            utils.isDirectory(pathToSymlinkToDir).then(function (value) {
                expect(value).toBe(true);
                done();
            }).catch(fail);
        });

        it('returns false for symlink to file', function (done) {
            utils.isDirectory(pathToSymlinkToFile).then(function (value) {
                expect(value).toBe(false);
                done();
            }).catch(fail);
        });

        it('broken symlink returns false', function (done) {
            utils.isFile(pathToBrokenSymlink)
                .then(function (value) {
                    expect(value).toBe(false);
                    done();
                });
        });
    });
});

describe('utils\' glob expressions', function () {
    beforeAll(function () {
        var fakeFs = {
            'source1.js': '',
            'source2.js': '',
            'source3.cpp': '',
            'source4.fs': '',
            'data1.json': '',
            'data2.json': '',
            'sub-directory-1': {
                'source5.js': '',
                'source6.cpp': '',
                'data3.json': '',
                'sub-sub-directory-1-1': {
                    'source7.js': '',
                    'data4.txt': '',
                    'symlink.js': mockFs.symlink({path: '../source5.js'})
                }
            },
            'sub-directory-2': {
                'source8.js': '',
                'source9.cpp': '',
                'data5.json': '',
                'sub-sub-directory-2-1': {
                    'source10.js': '',
                    'data6.txt': '',
                    'symlink.js': mockFs.symlink({path: '../'})
                },
                'sub-sub-directory-2-2': {
                    'symlink.js': mockFs.symlink({path: '../does/not/exist'})
                },
                'sub-sub-directory-2-3': mockFs.directory({mode: parseInt('666', 8),
                                                           items: {
                                                               'source11.js': ''
                                                           }})
            }
        };
        mockFs(fakeFs);
    });

    afterAll(mockFs.restore);

    describe('utils.globFiles', function () {
        it('returns an empty array if no match is found', function (done) {
            utils.globFiles(path.join('path', 'does', 'not', 'exist'))
                .then(function (files) {
                    expect(files).toEqual([]);
                    done();
                })
                .catch(function (err) {
                    fail(err);
                });
        });

        it('lists all files in current directory with * and ignores folders', function (done) {
            utils.globFiles('*')
                .then(function (files) {
                    expect(files.length).toBe(6);
                    expect(files).toEqual(jasmine.arrayContaining(['source1.js', 'source2.js', 'source3.cpp',
                                                                   'source4.fs', 'data1.json', 'data2.json']));
                    done();
                })
                .catch(fail);
        });

        it('list all *.js files in all first level sub-directories', function (done) {
            utils.globFiles('*/*.js')
                .then(function (files) {
                    expect(files.length).toBe(2);
                    expect(files).toEqual(jasmine.arrayContaining(['sub-directory-1/source5.js',
                                                                   'sub-directory-2/source8.js']));
                    done();
                })
                .catch(fail);
        });

        it('*.js includes symlink to files', function (done) {
            utils.globFiles(path.join('sub-directory-1', 'sub-sub-directory-1-1', '*.js'))
                .then(function (files) {
                    expect(files.length).toBe(2);
                    expect(files).toEqual(jasmine.arrayContaining([
                        path.join('sub-directory-1', 'sub-sub-directory-1-1', 'symlink.js'),
                        path.join('sub-directory-1', 'sub-sub-directory-1-1', 'source7.js')]));
                    done();
                })
                .catch(fail);
        });

        it('*.js does not include symlinks to directories', function (done) {
            utils.globFiles(path.join('sub-directory-2', 'sub-sub-directory-2-1', 'symlink.js'))
                .then(function (files) {
                    expect(files.length).toBe(0);
                    done();
                })
                .catch(fail);
        });

        it('broken symlink returns empty list', function (done) {
            utils.globFiles(path.join('sub-directory-2', 'sub-sub-directory-2-2', '*'))
                .then(function (files) {
                    expect([]).toEqual([]);
                    done();
                });
        });

        it('signals error in case folder is not executable', function (done) {
            utils.globFiles(path.join('sub-directory-2', 'sub-sub-directory-2-3', '*'))
                .then(function (files) {
                    fail('Expected utils.globFiles to fail!');
                })
                .catch(done);
        });
    });

    describe('utils.globDirectories', function () {
        it('returns an empty array if no match is found', function (done) {
            utils.globDirectories(path.join('path', 'does', 'not', 'exist'))
                .then(function (files) {
                    expect(files).toEqual([]);
                    done();
                })
                .catch(function (err) {
                    fail(err);
                });
        });

        it('lists all directories in current directory with * and ignores folders', function (done) {
            utils.globDirectories('*')
                .then(function (files) {
                    expect(files.length).toBe(2);
                    expect(files).toEqual(jasmine.arrayContaining(['sub-directory-1', 'sub-directory-2']));
                    done();
                })
                .catch(fail);
        });

        it('list all sub-sub-directories of the form *-1', function (done) {
            utils.globDirectories('*/*-1')
                .then(function (files) {
                    expect(files.length).toBe(2);
                    expect(files).toEqual(jasmine.arrayContaining(['sub-directory-1/sub-sub-directory-1-1',
                                                                   'sub-directory-2/sub-sub-directory-2-1']));
                    done();
                })
                .catch(fail);
        });

        it('does not include symlink to files', function (done) {
            utils.globDirectories(path.join('sub-directory-1', 'sub-sub-directory-1-1', '*'))
                .then(function (files) {
                    expect(files.length).toBe(0);
                    done();
                })
                .catch(fail);
        });

        it('includes symlinks to directories', function (done) {
            utils.globDirectories(path.join('sub-directory-2', 'sub-sub-directory-2-1', 'symlink.js'))
                .then(function (files) {
                    expect(files.length).toBe(1);
                    expect(files).toEqual([path.join('sub-directory-2', 'sub-sub-directory-2-1', 'symlink.js')]);
                    done();
                })
                .catch(fail);
        });

        it('broken symlink returns an empty list', function (done) {
            utils.globDirectories(path.join('sub-directory-2', 'sub-sub-directory-2-2', '*'))
                .then(function (files) {
                    expect(files).toEqual([]);
                    done();
                });
        });

        it('signals error in case folder is not executable', function (done) {
            utils.globDirectories(path.join('sub-directory-2', 'sub-sub-directory-2-3', '*'))
                .then(function (files) {
                    fail('Expected utils.globFiles to fail!');
                })
                .catch(done);
        });
    });
});

describe('utils\' list all files utility', function () {
    var allFiles = [
        path.join('dir-1', 'file1.js'),
        path.join('dir-1', 'file2.js'),
        path.join('dir-1', 'file3.txt'),
        path.join('dir-1', 'dir-1-1', 'file4.json'),
        path.join('dir-1', 'dir-1-1', 'file5.json'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'file6.cpp'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'file7.py'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'dir-1-1-1-1', 'file8.txt'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'dir-1-1-1-1', 'file33.cs'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'dir-1-1-1-2', 'file8.txt'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'file6.cpp'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'file7.py'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'dir-1-1-2-1', 'file8.txt'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'dir-1-1-2-1', 'file55'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'dir-1-1-2-2', 'file8.txt'),
        path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'dir-1-1-2-3', 'file18.cs'),
        path.join('dir-1', 'dir-1-2', 'file4.json'),
        path.join('dir-1', 'dir-1-2', 'file5.json'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-1', 'file6.cpp'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-1', 'file7.py'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-1', 'dir-1-2-1-1', 'file8.txt'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-1', 'dir-1-2-1-2', 'file8.txt'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-2', 'file6.cpp'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-2', 'file7.py'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-2', 'dir-1-2-2-1', 'file8.txt'),
        path.join('dir-1', 'dir-1-2', 'dir-1-2-2', 'dir-1-2-2-2', 'file8.txt'),
        path.join('dir-2', 'file1.js'),
        path.join('dir-2', 'file2.js'),
        path.join('dir-2', 'file3.txt'),
        path.join('dir-2', 'dir-2-1', 'file4.json'),
        path.join('dir-2', 'dir-2-1', 'file5.json'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-1', 'file6.cpp'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-1', 'file7.py'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-1', 'dir-2-1-1-1', 'file8.txt'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-1', 'dir-2-1-1-2', 'file8.txt'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-2', 'file6.cpp'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-2', 'file7.py'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-2', 'dir-2-1-2-1', 'file8.txt'),
        path.join('dir-2', 'dir-2-1', 'dir-2-1-2', 'dir-2-1-2-2', 'file8.txt'),
        path.join('dir-2', 'dir-2-2', 'file4.json'),
        path.join('dir-2', 'dir-2-2', 'file5.json'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-1', 'file6.cpp'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-1', 'file7.py'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-1', 'dir-2-2-1-1', 'file8.txt'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-1', 'dir-2-2-1-2', 'file8.txt'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-2', 'file6.cpp'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-2', 'file7.py'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-2', 'dir-2-2-2-1', 'file8.txt'),
        path.join('dir-2', 'dir-2-2', 'dir-2-2-2', 'dir-2-2-2-2', 'file8.txt')
    ];

    beforeAll(function () {
        var fakeFs = {
            'dir-1': {
                'file1.js': '',
                'file2.js': '',
                'dir-1-1': {
                    'file4.json': '',
                    'dir-1-1-1': {
                        'file6.cpp': '',
                        'dir-1-1-1-1': {
                            'file8.txt': '',
                            'file33.cs': ''
                        },
                        'file7.py': '',
                        'dir-1-1-1-2': {
                            'file8.txt': ''
                        }
                    },
                    'dir-1-1-2': {
                        'file6.cpp': '',
                        'dir-1-1-2-1': {
                            'file8.txt': '',
                            'file55': ''
                        },
                        'file7.py': '',
                        'dir-1-1-2-2': {
                            'file8.txt': ''
                        },
                        'dir-1-1-2-3': {
                            'file18.cs': ''
                        }
                    },
                    'file5.json': ''
                },
                'file3.txt': '',
                'dir-1-2': {
                    'file4.json': '',
                    'dir-1-2-1': {
                        'file6.cpp': '',
                        'dir-1-2-1-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-1-2-1-2': {
                            'file8.txt': ''
                        }
                    },
                    'dir-1-2-2': {
                        'file6.cpp': '',
                        'dir-1-2-2-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-1-2-2-2': {
                            'file8.txt': ''
                        }
                    },
                    'file5.json': ''
                }
            },
            'dir-2': {
                'file1.js': '',
                'file2.js': '',
                'dir-2-1': {
                    'file4.json': '',
                    'dir-2-1-1': {
                        'file6.cpp': '',
                        'dir-2-1-1-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-2-1-1-2': {
                            'file8.txt': ''
                        }
                    },
                    'dir-2-1-2': {
                        'file6.cpp': '',
                        'dir-2-1-2-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-2-1-2-2': {
                            'file8.txt': ''
                        }
                    },
                    'file5.json': ''
                },
                'file3.txt': '',
                'dir-2-2': {
                    'file4.json': '',
                    'dir-2-2-1': {
                        'file6.cpp': '',
                        'dir-2-2-1-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-2-2-1-2': {
                            'file8.txt': ''
                        }
                    },
                    'dir-2-2-2': {
                        'file6.cpp': '',
                        'dir-2-2-2-1': {
                            'file8.txt': ''
                        },
                        'file7.py': '',
                        'dir-2-2-2-2': {
                            'file8.txt': ''
                        },
                        'dir-2-2-3': {}
                    },
                    'file5.json': ''
                }
            }
        };

        mockFs(fakeFs);
    });

    afterAll(mockFs.restore);

    describe('utils.getAllFilesFromDirectory', function () {
        it('signals error if directory does not exist', function (done) {
            utils.getAllFilesFromDirectory(path.join('does', 'not', 'exist'))
                .then(function (files) {
                    expect(files).toEqual([]);
                    done();
                });
        });

        it('lists all files in directory leaf', function (done) {
            var dirPath = path.join('dir-1', 'dir-1-1', 'dir-1-1-1', 'dir-1-1-1-1');
            utils.getAllFilesFromDirectory(dirPath)
                .then(function (files) {
                    expect(files.length).toBe(2);
                    expect(files).toEqual(jasmine.arrayContaining([path.join(dirPath, 'file8.txt'),
                                                                   path.join(dirPath, 'file33.cs')]));
                    done();
                })
                .catch(fail);
        });

        it('lists all files in directory and its direct sub-driectories', function (done) {
            var dirPath = path.join('dir-1', 'dir-1-1', 'dir-1-1-1');
            utils.getAllFilesFromDirectory(dirPath)
                .then(function (files) {
                    expect(files.length).toBe(5);
                    expect(files).toEqual(jasmine.arrayContaining([
                        path.join(dirPath, 'file6.cpp'),
                        path.join(dirPath, 'dir-1-1-1-1', 'file8.txt'),
                        path.join(dirPath, 'dir-1-1-1-1', 'file33.cs'),
                        path.join(dirPath, 'file7.py'),
                        path.join(dirPath, 'dir-1-1-1-2', 'file8.txt')
                    ]));
                    done();
                })
                .catch(fail);
        });

        it('lists all files from mutliple sub-directories', function (done) {
            var dirPath = path.join('dir-1', 'dir-1-1', 'dir-1-1-2');
            utils.getAllFilesFromDirectory(dirPath)
                .then(function (files) {
                    expect(files.length).toBe(6);
                    expect(files).toEqual(jasmine.arrayContaining([
                        path.join(dirPath, 'file6.cpp'),
                        path.join(dirPath, 'file7.py'),
                        path.join(dirPath, 'dir-1-1-2-1', 'file8.txt'),
                        path.join(dirPath, 'dir-1-1-2-1', 'file55'),
                        path.join(dirPath, 'dir-1-1-2-2', 'file8.txt'),
                        path.join(dirPath, 'dir-1-1-2-3', 'file18.cs')
                    ]));
                    done();
                })
                .catch(fail);
        });

        it('list file if path is not a directory but a file', function (done) {
            var dirPath = path.join('dir-1', 'dir-1-1', 'dir-1-1-2', 'file6.cpp');
            utils.getAllFilesFromDirectory(dirPath)
                .then(function (files) {
                    expect(files.length).toBe(1);
                    expect(files).toEqual(jasmine.arrayContaining([dirPath]));
                    done();
                })
                .catch(fail);
        });

        it('lists all files in directory and all its sub-driectories', function (done) {
            utils.getAllFilesFromDirectory('.')
                .then(function (files) {
                    expect(files.length).toBe(allFiles.length);
                    expect(files).toEqual(jasmine.arrayContaining(allFiles));
                    done();
                })
                .catch(fail);
        });

        it('lists only files with correct file extensions', function (done) {
            utils.getAllFilesFromDirectory('.', ['.txt', '.cs'])
                .then(function (files) {
                    var expectedFiles = allFiles.filter(function (f) {
                        return f.endsWith('.txt') || f.endsWith('.cs');
                    });

                    expect(files.length).toBe(expectedFiles.length);
                    expect(files).toEqual(jasmine.arrayContaining(expectedFiles));
                    done();
                })
                .catch(fail);
        });

        it('lists only files without a file extension in case of ""', function (done) {
            utils.getAllFilesFromDirectory('.', [''])
                .then(function (files) {
                    var expectedFiles = allFiles.filter(function (f) {
                        var noExtension = false;
                        var parts = f.split(path.sep);
                        if (parts.length > 0) {
                            var fileName = parts[parts.length - 1];
                            noExtension = fileName.indexOf('.') === -1;
                        }
                        return noExtension;
                    });
                    expect(files.length).toBe(expectedFiles.length);
                    expect(files).toEqual(jasmine.arrayContaining(expectedFiles));
                    done();
                })
                .catch(fail);
        });
    });

    describe('utils.getAllFilesFromDirectories', function () {
        it('lists all files in directories and all their sub-driectories', function (done) {
            utils.getAllFilesFromDirectories(['./dir-1', 'dir-2'])
                .then(function (files) {
                    expect(files.length).toBe(allFiles.length);
                    expect(files).toEqual(jasmine.arrayContaining(allFiles));
                    done();
                })
                .catch(fail);
        });

        it('lists only files with correct file extensions', function (done) {
            utils.getAllFilesFromDirectories(['dir-1', './dir-2'], ['.txt', '.cs'])
                .then(function (files) {
                    var expectedFiles = allFiles.filter(function (f) {
                        return f.endsWith('.txt') || f.endsWith('.cs');
                    });

                    expect(files.length).toBe(expectedFiles.length);
                    expect(files).toEqual(jasmine.arrayContaining(expectedFiles));
                    done();
                })
                .catch(fail);
        });

        it('lists only files without a file extension in case of ""', function (done) {
            utils.getAllFilesFromDirectories(['./dir-1', './dir-2'], [''])
                .then(function (files) {
                    var expectedFiles = allFiles.filter(function (f) {
                        var noExtension = false;
                        var parts = f.split(path.sep);
                        if (parts.length > 0) {
                            var fileName = parts[parts.length - 1];
                            noExtension = fileName.indexOf('.') === -1;
                        }
                        return noExtension;
                    });
                    expect(files.length).toBe(expectedFiles.length);
                    expect(files).toEqual(jasmine.arrayContaining(expectedFiles));
                    done();
                })
                .catch(fail);
        });
    });

    describe('utils\' path utility', function () {
        describe('joinPaths', function () {
            it('returns [] in case of bad basePath type', function () {
                expect(utils.joinPaths()).toEqual([]);
                expect(utils.joinPaths({}, [])).toEqual([]);
            });

            it('returns [] in case of bad paths type', function () {
                expect(utils.joinPaths('')).toEqual([]);
                expect(utils.joinPaths('', {})).toEqual([]);
                expect(utils.joinPaths('', [{}])).toEqual([]);
            });

            it('returns empty array in case of empty paths', function () {
                expect(utils.joinPaths('')).toEqual([]);
            });

            it('returns original paths in case of empty basePath', function () {
                var paths = ['abc', path.join('def', 'ghi'), 'jkl'];
                expect(utils.joinPaths('', paths)).toEqual(paths);
                expect(utils.joinPaths('', paths)).not.toBe(paths);
            });

            it('returns joined paths joined on relative basePath', function () {
                var paths = ['abc', path.join('def', 'ghi'), path.join('/', 'jkl', 'lmno', 'pqrs')];
                var joinedPaths = [path.join('base', 'path', 'abc'), path.join('base', 'path', 'def', 'ghi'),
                                   path.join('/', 'jkl', 'lmno', 'pqrs')];
                var basePath = path.join('base', 'path');
                expect(utils.joinPaths(basePath, paths)).toEqual(joinedPaths);
            });

            it('returns joined paths joined on absolue basePath', function () {
                var paths = ['abc', path.join('def', 'ghi'), path.join('/', 'jkl', 'lmno', 'pqrs')];
                var basePath = path.join('/', 'base', 'path');
                var joinedPaths = [path.join('/', 'base', 'path', 'abc'), path.join('/', 'base', 'path', 'def', 'ghi'),
                                   path.join('/', 'jkl', 'lmno', 'pqrs')];
                expect(utils.joinPaths(basePath, paths)).toEqual(joinedPaths);
            });
        });
    });
});
