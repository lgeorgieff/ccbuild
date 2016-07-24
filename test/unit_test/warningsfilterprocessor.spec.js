/**
 * @ignore
 * @suppress {duplicate}
 */
var mockFs = require('mock-fs');

/**
 * @ignore
 * @suppress {duplicate}
 */
var WarningsFilterProcessor = require('../../src/WarningsFilterProcessor.js');

/**
 * @ignore
 * @suppress {duplicate}
 */
var GCCMessage = require('../../src/GCCMessage.js');

describe('The module WarningsFilterProcessor', function () {
    it('exports the function getWarningsFilterProcessor', function () {
        expect(WarningsFilterProcessor).toBeDefined();
        expect(typeof WarningsFilterProcessor).toBe('function');
    });

    describe('the function getWarningsFilterProcessor', function () {
        it('throws an error in case it is invoked with bad arguments', function () {
            expect(function () { WarningsFilterProcessor(); }).toThrowError();
            expect(function () { WarningsFilterProcessor(new Object()); }).toThrowError();
            expect(function () { WarningsFilterProcessor(''); }).toThrowError();
        });

        it('returns an instance of WarningsFilterProcessor in case it is called property', function () {
            expect(WarningsFilterProcessor(0)).toBeDefined();
            expect(WarningsFilterProcessor(0)).not.toBeNull();
            expect(WarningsFilterProcessor(0).constructor.name).toBe('WarningsFilterProcessor');
        });

        it('returns an existing instance of WarnignsFilterProcessor in case it is invoked multiple times', function () {
            var wfp = WarningsFilterProcessor(0);
            expect(WarningsFilterProcessor(0)).toBe(wfp);
            expect(WarningsFilterProcessor(1)).toBe(wfp);
        });
    });

    describe('WarningsFilterProcessor', function () {
        var warningText = 'src/GCCMessage.js:5: WARNING - Parse error. unknown @suppress parameter: duplcate\n' +
                ' * @suppress {duplcate}\n' +
                '              ^";';

        var errorText = 'some filter 6\n' +
                'var util = require(\'util\');\n' +
                '    ^\n';

        var statusText = '1 error(s), 1 warning(s)\n';

        var statusTextTyped = '0 error(s), 1 warning(s), 83.7% typed\n';

        var extendedStatusText = '0 error(s), 1 warning(s), 5 filtered warning(s)\n';

        var extendedStatusTextTyped = '0 error(s), 1 warning(s), 3 filtered warning(s), 83.7% typed\n';

        var otherText = 'Some text that is not a WARNING, not an ERROR and not a STATUS message\n' +
                'Another line of a message\n' +
                'This is the last line of the message\n';

        var errorMessage = new GCCMessage(errorText);
        var warningMessage = new GCCMessage(warningText);
        var statusMessage = new GCCMessage(statusText);
        var extendedStatusMessage = new GCCMessage(extendedStatusText);
        var extendedStatusMessageTyped = new GCCMessage(extendedStatusTextTyped);
        var otherMessage = new GCCMessage(otherText);
        var statusMessageTyped = new GCCMessage(statusTextTyped);

        var wfp = WarningsFilterProcessor(0);
        var filter1 = 'some filter 1\nsome filter 2\nsome filter 23\nsrc/GCCMessage.js:5: WARNING - Parse error. ' +
                'unknown @suppress parameter: duplcate';
        var filter2 = 'some filter 2\nsome filter 3\nsome filter 4';
        var filter3 = 'some filter 5\nsome filter 6\nsome filter 7';

        beforeAll(function () {
            mockFs({
                'some/path/1.txt': filter1,
                'some/path/2.txt': filter2,
                'some/other/path/1.txt': filter3
            });
        });

        afterAll(function () {
            mockFs.restore();
        });

        it('.registerWarningsFilterFile works properly', function (done) {
            wfp.registerWarningsFilterFile('some/path/1.txt')
                .then(done)
                .catch(fail);
        });

        it('.registerWarningsFilterFile works properly if one file is registered mutliple times', function (done) {
            wfp.registerWarningsFilterFile('some/path/1.txt')
                .then(function () {
                    return wfp.registerWarningsFilterFile('some/path/1.txt');
                })
                .then(done)
                .catch(fail);
        });

        it('.registerWarningsFilterFile works properly if multiple files are registered', function (done) {
            wfp.registerWarningsFilterFile('some/path/2.txt')
                .then(function () {
                    return wfp.registerWarningsFilterFile('some/other/path/1.txt');
                })
                .then(done)
                .catch(fail);
        });

        it('.registerWarningsFilterFile reject in case of non-existing file', function (done) {
            wfp.registerWarningsFilterFile('does/not/exist.txt')
                .then(function () {
                    fail('Expected WarningsFilterProcessor.registerWarningsFilterFile() to fail!');
                })
                .catch(done);
        });

        it('.getFilters works properly', function () {
            expect(wfp.getFilters()).toEqual([]);
            expect(wfp.getFilters(null)).toEqual([]);
            expect(wfp.getFilters([])).toEqual([]);
            expect(wfp.getFilters(['some/path/1.txt']).length).toEqual(filter1.split('\n').length);
            expect(wfp.getFilters(['some/path/1.txt'])).toEqual(jasmine.arrayContaining(filter1.split('\n')));
            var expectedResult = (filter1 + '\n' + filter2 + '\n' + filter3)
                    .split('\n')
                    .reduce(function (acc, str) {
                        if (acc.indexOf(str) === -1) acc.push(str);
                        return acc;
                    }, []);
            expect(wfp.getFilters(['some/path/1.txt', 'some/path/2.txt', 'some/other/path/1.txt']).length)
                .toBe(expectedResult.length);
            expect(wfp.getFilters(['some/path/1.txt', 'some/path/2.txt', 'some/other/path/1.txt']))
                .toEqual(jasmine.arrayContaining(expectedResult));
        });

        it('.getFilters throws in case of bad argument', function () {
            expect(function () { wfp.getFilters(''); }).toThrowError();
            expect(function () { wfp.getFilters(12); }).toThrowError();
        });

        it('.processMessages throws in case of bad arguments', function () {
            expect(function () { wfp.processMessages('', ''); }).toThrowError();
            expect(function () { wfp.processMessages(null, ''); }).toThrowError();
            expect(function () { wfp.processMessages('', null); }).toThrowError();
        });

        it('.processMessages works properly', function () {
            var messages = [errorMessage, warningMessage, statusMessage, extendedStatusMessage,
                            extendedStatusMessageTyped, otherMessage, statusMessageTyped];
            var filters = ['some/path/1.txt', 'some/path/2.txt', 'some/other/path/1.txt'];
            expect(wfp.processMessages()).toEqual([]);
            expect(wfp.processMessages(messages).length).toBe(messages.length);
            expect(wfp.processMessages(messages)).toEqual(jasmine.arrayContaining(messages));
            var results = wfp.processMessages(messages, filters);
            expect(results.length).toBe(messages.length - 1);
            expect(results).toEqual(jasmine.arrayContaining(
                [errorMessage, statusMessage, extendedStatusMessage, extendedStatusMessageTyped, otherMessage,
                 statusMessageTyped]));
            expect(results[results.length - 1].toString())
                .toBe('0 error(s), 5 warning(s), 1 filtered warning(s), 83.7% typed\n');
        });
    });
});
