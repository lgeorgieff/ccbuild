'use strict';

/**
 * @ignore
 * @suppress {duplicate}
 */
var GCCResultProcessor = require('../../src/GCCResultProcessor.js');

/**
 * @ignore
 * @suppress {duplicate}
 */
var GCCMessage = require('../../src/GCCMessage.js');

describe('The class GCCResultProcessor', function () {
    it('throws an error in case of bad arguments', function () {
        expect(function () { new GCCResultProcessor(); }).toThrowError();
        expect(function () { new GCCResultProcessor('', '', ''); }).toThrowError();
        expect(function () { new GCCResultProcessor(12, 12); }).toThrowError();
        expect(function () { new GCCResultProcessor(12, 12, 12); }).toThrowError();
        expect(function () { new GCCResultProcessor(12, '', 12); }).toThrowError();
    });

    it('can be instantiated in case of correct arguments', function () {
        expect(new GCCResultProcessor(0)).toEqual(jasmine.any(GCCResultProcessor));
        expect(new GCCResultProcessor(0, 'some text')).toEqual(jasmine.any(GCCResultProcessor));
        expect(new GCCResultProcessor(0, 'some text', 'some text')).toEqual(jasmine.any(GCCResultProcessor));
    });

    describe('if instantiated properly', function () {
        var stderr1 = 'src/GCCMessage.js:5: WARNING - Parse error. unknown @suppress parameter: duplcate\n' +
                ' * @suppress {duplcate}\n' +
                '              ^";\n\n' +
                'src/GCCMessage.js:7: ERROR - Variable util first declared in ./tools/node.js_closure_compiler_' +
                'externs/util.js\n' +
                'var util = require(\'util\');\n' +
                '    ^\n\n' +
                'Some text that is not a WARNING, not an ERROR and not a STATUS message\n' +
                'Another line of a message\n' +
                'This is the last line of the message\n\n' +
                '1 error(s), 1 warning(s)\n';
        var stderr2 = 'src/GCCMessage.js:7: ERROR - Variable util first declared in ./tools/node.js_closure_compiler_' +
                'externs/util.js\n' +
                'var util = require(\'util\');\n' +
                '    ^\n\n' +
                'Some text that is not a WARNING, not an ERROR and not a STATUS message\n' +
                'Another line of a message\n' +
                'This is the last line of the message\n\n' +
                '1 error(s), 1 warning(s)\n';
        var stderr3 = 'src/GCCMessage.js:5: WARNING - Parse error. unknown @suppress parameter: duplcate\n' +
                ' * @suppress {duplcate}\n' +
                '              ^";\n\n' +
                'Some text that is not a WARNING, not an ERROR and not a STATUS message\n' +
                'Another line of a message\n' +
                'This is the last line of the message\n\n' +
                '1 error(s), 1 warning(s)\n';
        var stderr4 = 'src/GCCMessage.js:5: WARNING - Parse error. unknown @suppress parameter: duplcate\n' +
                ' * @suppress {duplcate}\n' +
                '              ^";\n\n' +
                'src/GCCMessage.js:7: ERROR - Variable util first declared in ./tools/node.js_closure_compiler_' +
                'externs/util.js\n' +
                'var util = require(\'util\');\n' +
                '    ^\n\n' +
                '1 error(s), 1 warning(s)\n' +
                'Some text that is not a WARNING, not an ERROR and not a STATUS message\n' +
                'Another line of a message\n' +
                'This is the last line of the message\n';
        var stdout = 'console.log();';

        it('getCode works properly', function () {
            expect(new GCCResultProcessor(0).getCode()).toBe(0);
            expect(new GCCResultProcessor(1).getCode()).toBe(1);
        });

        it('getCompiledCode works properly', function () {
            expect(new GCCResultProcessor(0, '', '').getCompiledCode()).toBe('');
            expect(new GCCResultProcessor(1, '', '').getCompiledCode()).toBe('');
            expect(new GCCResultProcessor(1, stdout, '').getCompiledCode()).toBe('');
            expect(new GCCResultProcessor(0, stdout, '').getCompiledCode()).toBe(stdout);
        });

        it('hasCompiledCode works properly', function () {
            expect(new GCCResultProcessor(0, '', '').hasCompiledCode()).toBe(false);
            expect(new GCCResultProcessor(1, '', '').hasCompiledCode()).toBe(false);
            expect(new GCCResultProcessor(1, stdout, '').hasCompiledCode()).toBe(false);
            expect(new GCCResultProcessor(0, stdout, '').hasCompiledCode()).toBe(true);
        });

        it('hasWarnings works properly', function () {
            expect(new GCCResultProcessor(0, '', '').hasWarnings()).toBe(false);
            expect((new GCCResultProcessor(0, stdout, stderr1)).hasWarnings()).toBe(true);
            expect((new GCCResultProcessor(0, stdout, stderr2)).hasWarnings()).toBe(false);
            expect((new GCCResultProcessor(0, null, stderr1)).hasWarnings()).toBe(true);
        });

        it('hasErrors works properly', function () {
            expect(new GCCResultProcessor(0, '', '').hasErrors()).toBe(false);
            expect((new GCCResultProcessor(0, stdout, stderr1)).hasErrors()).toBe(true);
            expect((new GCCResultProcessor(0, stdout, stderr3)).hasErrors()).toBe(false);
            expect((new GCCResultProcessor(0, null, stderr1)).hasErrors()).toBe(true);
        });

        it('getErrors works properly', function () {
            var err = 'src/GCCMessage.js:7: ERROR - Variable util first declared in ./tools/node.js_closure_compiler_' +
                    'externs/util.js\n' +
                    'var util = require(\'util\');\n' +
                    '    ^\n';
            expect(new GCCResultProcessor(0, '', '').getErrors()).toEqual([]);
            expect((new GCCResultProcessor(0, stdout, stderr1)).getErrors().length).toBe(1);
            expect((new GCCResultProcessor(0, stdout, stderr1)).getErrors()[0].toString())
                .toBe(err);
            expect((new GCCResultProcessor(0, stdout, stderr3)).getErrors()).toEqual([]);
            expect((new GCCResultProcessor(0, null, stderr2)).getErrors().length).toBe(1);
            expect((new GCCResultProcessor(0, null, stderr2)).getErrors()[0].toString()).toBe(err);
        });

        it('getWarnings works properly', function () {
            var warning = 'src/GCCMessage.js:5: WARNING - Parse error. unknown @suppress parameter: duplcate\n' +
                    ' * @suppress {duplcate}\n' +
                    '              ^";\n';
            expect(new GCCResultProcessor(0, '', '').getWarnings()).toEqual([]);
            expect((new GCCResultProcessor(0, stdout, stderr1)).getWarnings().length).toBe(1);
            expect((new GCCResultProcessor(0, stdout, stderr1)).getWarnings()[0].toString())
                .toBe(warning);
            expect((new GCCResultProcessor(0, stdout, stderr2)).getWarnings()).toEqual([]);
            expect((new GCCResultProcessor(0, null, stderr3)).getWarnings().length).toBe(1);
            expect((new GCCResultProcessor(0, null, stderr3)).getWarnings()[0].toString()).toBe(warning);
        });

        it('getStatusLine works properly', function () {
            var status = '1 error(s), 1 warning(s)\n';
            expect(new GCCResultProcessor(0, '', '').getStatusLine()).toBeNull();
            expect((new GCCResultProcessor(0, stdout, stderr1)).getStatusLine().toString())
                .toBe(status);
            expect((new GCCResultProcessor(0, null, stderr4)).getStatusLine()).toBeNull();
        });

        it('getResults works properly', function () {
            expect(new GCCResultProcessor(0, '', '').getResults()).toEqual([]);
            var warning = 'src/GCCMessage.js:5: WARNING - Parse error. unknown @suppress parameter: duplcate\n' +
                    ' * @suppress {duplcate}\n' +
                    '              ^";\n';
            var error = 'src/GCCMessage.js:7: ERROR - Variable util first declared in ./tools/node.js_closure_' +
                    'compiler_externs/util.js\n' +
                    'var util = require(\'util\');\n' +
                    '    ^\n';
            var other = 'Some text that is not a WARNING, not an ERROR and not a STATUS message\n' +
                    'Another line of a message\n' +
                    'This is the last line of the message\n';
            var status = '1 error(s), 1 warning(s)\n';
            var grp = new GCCResultProcessor(0, stdout, stderr1);
            expect(grp.getResults().length).toBe(4);
            expect(grp.getResults()[0].toString()).toBe(warning);
            expect(grp.getResults()[1].toString()).toBe(error);
            expect(grp.getResults()[2].toString()).toBe(other);
            expect(grp.getResults()[3].toString()).toBe(status);
        });
    });
});
