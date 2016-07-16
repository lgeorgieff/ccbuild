/**
 * @ignore
 * @suppress {duplicate}
 */
var GCCMessage = require('../../src/GCCMessage.js');

var warningText = 'src/GCCMessage.js:5: WARNING - Parse error. unknown @suppress parameter: duplcate\n' +
        ' * @suppress {duplcate}\n' +
        '              ^";';

var errorText = 'src/GCCMessage.js:7: ERROR - Variable util first declared in ./tools/node.js_closure_compiler_' +
        'externs/util.js\n' +
        'var util = require(\'util\');\n' +
        '    ^\n';

var statusText = '1 error(s), 1 warning(s)\n';

var statusTextTyped = '0 error(s), 1 warning(s), 83.7% typed\n';

var extendedStatusText = '0 error(s), 1 warning(s), 5 filtered warning(s)\n';

var extendedStatusTextTyped = '0 error(s), 1 warning(s), 3 filtered warning(s), 83.7% typed\n';

var otherText = 'Some text that is not a WARNING, not an ERROR and not a STATUS message\n' +
        'Another line of a message\n' +
        'This is the last line of the message\n';

describe('The class GCCMessage', function () {
    it('throws if no argument is present', function () {
        expect(function () {
            new GCCMessage();
        }).toThrowError(Error);
    });

    it('throws if bad argument is present', function () {
        expect(function () {
            new GCCMessage(null);
        }).toThrowError(Error);

        expect(function () {
            new GCCMessage(undefined);
        }).toThrowError(Error);

        expect(function () {
            new GCCMessage(123);
        }).toThrowError(Error);
    });

    it('is instantiated properly if a strig argument is present', function () {
        expect(function () {
            new GCCMessage('');
        }).not.toThrow();

        expect(function () {
            new GCCMessage('Hello World!');
        }).not.toThrow();
    });

    describe('when successfully instantiated', function () {
        var errorMessage;
        var warningMessage;
        var statusMessage;
        var statusMessageTyped;
        var extendedStatusMessage;
        var extendedStatusMessageTyped;
        var otherMessage;

        beforeAll(function () {
            errorMessage = new GCCMessage(errorText);
            warningMessage = new GCCMessage(warningText);
            statusMessage = new GCCMessage(statusText);
            statusMessageTyped = new GCCMessage(statusTextTyped);
            extendedStatusMessage = new GCCMessage(extendedStatusText);
            extendedStatusMessageTyped = new GCCMessage(extendedStatusTextTyped);
            otherMessage = new GCCMessage(otherText);
        });

        it('hasHeading works properly', function () {
            expect(errorMessage.hasHeading()).toBe(true);
            expect(warningMessage.hasHeading()).toBe(true);
            expect(statusMessage.hasHeading()).toBe(false);
            expect(statusMessageTyped.hasHeading()).toBe(false);
            expect(extendedStatusMessage.hasHeading()).toBe(false);
            expect(extendedStatusMessageTyped.hasHeading()).toBe(false);
            expect(otherMessage.hasHeading()).toBe(true);
        });

        it('getHeading works properly', function () {
            expect(errorMessage.getHeading())
                .toBe('src/GCCMessage.js:7: ERROR - Variable util first declared in ./tools/node.js_closure_compiler' +
                      '_externs/util.js');
            expect(warningMessage.getHeading())
                .toBe('src/GCCMessage.js:5: WARNING - Parse error. unknown @suppress parameter: duplcate');
            expect(statusMessage.getHeading()).toBeNull();
            expect(statusMessageTyped.getHeading()).toBeNull();
            expect(extendedStatusMessage.getHeading()).toBeNull();
            expect(extendedStatusMessageTyped.getHeading()).toBeNull();
            expect(otherMessage.getHeading())
                .toBe('Some text that is not a WARNING, not an ERROR and not a STATUS message');
        });

        it('hasMessage works properly', function () {
            expect(errorMessage.hasMessage()).toBe(true);
            expect(warningMessage.hasMessage()).toBe(true);
            expect(statusMessage.hasMessage()).toBe(false);
            expect(statusMessageTyped.hasMessage()).toBe(false);
            expect(extendedStatusMessage.hasMessage()).toBe(false);
            expect(extendedStatusMessageTyped.hasMessage()).toBe(false);
            expect(otherMessage.hasMessage()).toBe(true);
        });

        it('getMessage works properly', function () {
            expect(errorMessage.getMessage()).toBe('var util = require(\'util\');\n' +
                                                   '    ^');
            expect(warningMessage.getMessage()).toBe(' * @suppress {duplcate}\n' +
                                                     '              ^";');
            expect(statusMessage.getMessage()).toBeNull();
            expect(statusMessageTyped.getMessage()).toBeNull();
            expect(extendedStatusMessage.getMessage()).toBeNull();
            expect(extendedStatusMessageTyped.getMessage()).toBeNull();
            expect(otherMessage.getMessage())
                .toBe('Another line of a message\nThis is the last line of the message');
        });

        it('isStatus works properly', function () {
            expect(errorMessage.isStatus()).toBe(false);
            expect(warningMessage.isStatus()).toBe(false);
            expect(statusMessage.isStatus()).toBe(true);
            expect(statusMessageTyped.isStatus()).toBe(true);
            expect(extendedStatusMessage.isStatus()).toBe(true);
            expect(extendedStatusMessageTyped.isStatus()).toBe(true);
            expect(otherMessage.isStatus()).toBe(false);
        });

        it('getStatus works properly', function () {
            expect(function () { errorMessage.getStatus(); }).toThrowError();
            expect(function () { warningMessage.getStatus(); }).toThrowError();
            expect(statusMessage.getStatus()).toBe('1 error(s), 1 warning(s)');
            expect(statusMessageTyped.getStatus()).toBe('0 error(s), 1 warning(s), 83.7% typed');
            expect(extendedStatusMessage.getStatus()).toBe('0 error(s), 1 warning(s), 5 filtered warning(s)');
            expect(extendedStatusMessageTyped.getStatus())
                .toBe('0 error(s), 1 warning(s), 3 filtered warning(s), 83.7% typed');
            expect(function () { otherMessage.getStatus(); }).toThrowError();
        });

        it('isWarning works properly', function () {
            expect(errorMessage.isWarning()).toBe(false);
            expect(warningMessage.isWarning()).toBe(true);
            expect(statusMessage.isWarning()).toBe(false);
            expect(statusMessageTyped.isWarning()).toBe(false);
            expect(extendedStatusMessage.isWarning()).toBe(false);
            expect(extendedStatusMessageTyped.isWarning()).toBe(false);
            expect(otherMessage.isWarning()).toBe(false);
        });

        it('isError works properly', function () {
            expect(errorMessage.isError()).toBe(true);
            expect(warningMessage.isError()).toBe(false);
            expect(statusMessage.isError()).toBe(false);
            expect(statusMessageTyped.isError()).toBe(false);
            expect(extendedStatusMessage.isError()).toBe(false);
            expect(extendedStatusMessageTyped.isError()).toBe(false);
            expect(otherMessage.isError()).toBe(false);
        });

        it('getErrorsCount works properly', function () {
            expect(function () { errorMessage.getWarningsCount(); }).toThrowError();
            expect(function () { warningMessage.getWarningsCount(); }).toThrowError();
            expect(statusMessage.getWarningsCount()).toBe(1);
            expect(statusMessageTyped.getWarningsCount()).toBe(1);
            expect(extendedStatusMessage.getWarningsCount()).toBe(1);
            expect(extendedStatusMessageTyped.getWarningsCount()).toBe(1);
            expect(function () { otherMessage.getWarningsCount(); }).toThrowError();
        });

        it('getWarningsCount works properly', function () {
            expect(function () { errorMessage.getErrorsCount(); }).toThrowError();
            expect(function () { warningMessage.getErrorsCount(); }).toThrowError();
            expect(statusMessage.getErrorsCount()).toBe(1);
            expect(statusMessageTyped.getErrorsCount()).toBe(0);
            expect(extendedStatusMessage.getErrorsCount()).toBe(0);
            expect(extendedStatusMessageTyped.getErrorsCount()).toBe(0);
            expect(function () { otherMessage.getErrorsCount(); }).toThrowError();
        });

        it('getFilteredWarningsCount works properly', function () {
            expect(function () { errorMessage.getFilteredWarningsCount(); }).toThrowError();
            expect(function () { warningMessage.getFilteredWarningsCount(); }).toThrowError();
            expect(statusMessage.getFilteredWarningsCount()).toBe(-1);
            expect(statusMessageTyped.getFilteredWarningsCount()).toBe(-1);
            expect(extendedStatusMessage.getFilteredWarningsCount()).toBe(5);
            expect(extendedStatusMessageTyped.getFilteredWarningsCount()).toBe(3);
            expect(function () { otherMessage.getFilteredWarningsCount(); }).toThrowError();
        });

        it('getTypedRatio works properly', function () {
            expect(function () { errorMessage.getTypedRatio(); }).toThrowError();
            expect(function () { warningMessage.getTypedRatio(); }).toThrowError();
            expect(statusMessage.getTypedRatio()).toBeNull();
            expect(statusMessageTyped.getTypedRatio()).toBe('83.7');
            expect(extendedStatusMessage.getTypedRatio()).toBeNull();
            expect(extendedStatusMessageTyped.getTypedRatio()).toBe('83.7');
            expect(function () { otherMessage.getTypedRatio(); }).toThrowError();
        });

        it('setErrorsCount works properly', function () {
            expect(function () { errorMessage.setErrorsCount(12); }).toThrowError();
            expect(function () { warningMessage.setErrorsCount(12); }).toThrowError();
            expect(function () { statusMessage.setErrorsCount('1'); }).toThrowError();
            expect(statusMessage.setErrorsCount(12)).toBeUndefined();
            expect(statusMessageTyped.setErrorsCount(12)).toBeUndefined();
            expect(extendedStatusMessage.setErrorsCount(12)).toBeUndefined();
            expect(extendedStatusMessageTyped.setErrorsCount(12)).toBeUndefined();
            expect(function () { otherMessage.setErrorsCount(12); }).toThrowError();
            expect(statusMessage.getStatus())
                .toBe('12 error(s), 1 warning(s), 0 filtered warning(s), 0.0% typed');
            expect(statusMessageTyped.getStatus())
                .toBe('12 error(s), 1 warning(s), 0 filtered warning(s), 83.7% typed');
            expect(extendedStatusMessage.getStatus())
                .toBe('12 error(s), 1 warning(s), 5 filtered warning(s), 0.0% typed');
            expect(extendedStatusMessageTyped.getStatus())
                .toBe('12 error(s), 1 warning(s), 3 filtered warning(s), 83.7% typed');
        });

        it('setWarningsCount works properly', function () {
            expect(function () { errorMessage.setWarningsCount(7); }).toThrowError();
            expect(function () { warningMessage.setWarningsCount(7); }).toThrowError();
            expect(function () { statusMessage.setWarningsCount('1'); }).toThrowError();
            expect(statusMessage.setWarningsCount(7)).toBeUndefined();
            expect(statusMessageTyped.setWarningsCount(7)).toBeUndefined();
            expect(extendedStatusMessage.setWarningsCount(7)).toBeUndefined();
            expect(extendedStatusMessageTyped.setWarningsCount(7)).toBeUndefined();
            expect(function () { otherMessage.setWarningsCount(7); }).toThrowError();
            expect(statusMessage.getStatus())
                .toBe('12 error(s), 7 warning(s), 0 filtered warning(s), 0.0% typed');
            expect(statusMessageTyped.getStatus())
                .toBe('12 error(s), 7 warning(s), 0 filtered warning(s), 83.7% typed');
            expect(extendedStatusMessage.getStatus())
                .toBe('12 error(s), 7 warning(s), 5 filtered warning(s), 0.0% typed');
            expect(extendedStatusMessageTyped.getStatus())
                .toBe('12 error(s), 7 warning(s), 3 filtered warning(s), 83.7% typed');
        });

        it('setFilteredWarningsCount works properly', function () {
            expect(function () { errorMessage.setFilteredWarningsCount(1); }).toThrowError();
            expect(function () { warningMessage.setFilteredWarningsCount(1); }).toThrowError();
            expect(function () { statusMessage.setFilteredWarningsCount('1'); }).toThrowError();
            expect(statusMessage.setFilteredWarningsCount(1)).toBeUndefined();
            expect(statusMessageTyped.setFilteredWarningsCount(1)).toBeUndefined();
            expect(extendedStatusMessage.setFilteredWarningsCount(1)).toBeUndefined();
            expect(extendedStatusMessageTyped.setFilteredWarningsCount(1)).toBeUndefined();
            expect(function () { otherMessage.setFilteredWarningsCount(7); }).toThrowError();
            expect(statusMessage.getStatus())
                .toBe('12 error(s), 7 warning(s), 1 filtered warning(s), 0.0% typed');
            expect(statusMessageTyped.getStatus())
                .toBe('12 error(s), 7 warning(s), 1 filtered warning(s), 83.7% typed');
            expect(extendedStatusMessage.getStatus())
                .toBe('12 error(s), 7 warning(s), 1 filtered warning(s), 0.0% typed');
            expect(extendedStatusMessageTyped.getStatus())
                .toBe('12 error(s), 7 warning(s), 1 filtered warning(s), 83.7% typed');
        });

        it('toString works properly', function () {
            expect(errorMessage.toString()).toBe(errorText);
            expect(warningMessage.toString()).toBe(warningText + '\n');
            expect(statusMessage.toString())
                .toBe('12 error(s), 7 warning(s), 1 filtered warning(s), 0.0% typed\n');
            expect(statusMessageTyped.toString())
                .toBe('12 error(s), 7 warning(s), 1 filtered warning(s), 83.7% typed\n');
            expect(extendedStatusMessage.toString())
                .toBe('12 error(s), 7 warning(s), 1 filtered warning(s), 0.0% typed\n');
            expect(extendedStatusMessageTyped.toString())
                .toBe('12 error(s), 7 warning(s), 1 filtered warning(s), 83.7% typed\n');
            expect(otherMessage.toString()).toBe(otherText);
        });

        it('is transformed properly to a string by messagesToString', function () {
            expect(GCCMessage.messagesToString()).toBe('');
            expect(GCCMessage.messagesToString(null)).toBe('');
            expect(GCCMessage.messagesToString([])).toBe('');
            expect(function () { GCCMessage.messagesToString(123); }).toThrowError();
            var expectedString =
                    errorMessage.toString() + '\n' +
                    warningMessage.toString() + '\n' +
                    statusMessage.toString() + '\n' +
                    statusMessageTyped.toString() + '\n' +
                    extendedStatusMessage.toString() + '\n' +
                    extendedStatusMessageTyped.toString() + '\n' +
                    otherMessage + '\n';
            expect(GCCMessage.messagesToString([errorMessage,
                                                warningMessage,
                                                statusMessage,
                                                statusMessageTyped,
                                                extendedStatusMessage,
                                                extendedStatusMessageTyped,
                                                otherMessage])).toBe(expectedString);
        });
    });
});
