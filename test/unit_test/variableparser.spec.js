/**
 * @ignore
 * @suppress {duplicate}
 */
var VariableParser = /** @type {function(new:VariableParser, VariableManager)} */
    (require('../../src/VariableParser.js'));

/**
 * @ignore
 * @suppress {duplicate}
 */
var VariableManager = /** @type {function(new:VariableManager, VariableManager=)} */
    (require('../../src/VariableManager.js'));

describe('Class VariableParser', function () {
    it('throws in case constructed without a parameter', function () {
        expect(function () {
            new VariableParser();
        }).toThrowError();
    });

    it('throws in case constructed with bad variableManager parameter', function () {
        expect(function () {
            new VariableParser({});
        }).toThrowError();
    });

    it('does not throw in case constructed propery', function () {
        expect(function () {
            new VariableParser(new VariableManager());
        }).not.toThrow();
    });

    describe('if instantiated properly', function () {
        var vp;
        beforeEach(function () {
            var vm = new VariableManager();
            vm.set('var1', 'value1');
            vm.set('_', 'lodash');
            vm.set('Hello', 'World!');
            vm.set('$_var2', 'Hello World!');
            vp = new VariableParser(vm);
        });

        it('parse() throws in case str is not of type string', function () {
            expect(function () {
                vp.resolve(123);
            }).toThrowError();
        });

        it('parse() does not throw in case of an empty string', function () {
            expect(function () {
                vp.resolve('');
            }).not.toThrow();
        });

        it('parse() returns empty string in case of an empty string parameter', function () {
            expect(vp.resolve('')).toBe('');
        });

        it('parse() does return original sring in case no variables are used', function () {
            expect(vp.resolve('Hello World!')).toBe('Hello World!');
        });

        it('parse() replaces variable by its value', function () {
            expect(vp.resolve('var1 = "${var1}"')).toBe('var1 = "value1"');
            expect(vp.resolve('${_} : _')).toBe('lodash : _');
            expect(vp.resolve('Hello ${Hello}')).toBe('Hello World!');
            expect(vp.resolve('${$_var2}')).toBe('Hello World!');
        });

        it('parse() replaces multiple variables by their values', function () {
            var str = '${var1}${_} abc ${${Hello}  !!=\\}${$_var2}';
            expect(vp.resolve(str)).toBe('value1lodash abc ${World!  !!=\\}Hello World!');
        });

        it('parse() replaces multiple occurrence of the same variable by it value', function () {
            var str = '${var1} and another ${var1}';
            expect(vp.resolve(str)).toBe('value1 and another value1');
        });

        it('parse() throws an error in case an undefined variable name is used', function () {
            expect(function () {
                vp.resolve('${}');
            }).toThrowError();

            expect(function () {
                vp.resolve('${doesNotExist}');
            }).toThrowError();
        });
    });
});
