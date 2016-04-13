'use strict';

var VariableManager = require('../../src/VariableManager.js');

describe('Class VariableManager', function () {
    it('is exported', function () {
        expect(VariableManager).toEqual(jasmine.any(Function));
    });

    it('can be instantiated without a parameter', function () {
        expect(function () {
            new VariableManager();
        }).not.toThrow();
        expect(new VariableManager()).toEqual(jasmine.any(VariableManager));
    });

    it('can be instantiated source parameter', function () {
        expect(function () {
            new VariableManager(new VariableManager());
        }).not.toThrow();
        expect(new VariableManager(new VariableManager())).toEqual(jasmine.any(VariableManager));
    });

    it('throws in case of bad type of source parameter', function () {
        expect(function () {
            new VariableManager({});
        }).toThrowError();
    });

    describe('when instantiated properly', function () {
        var vm;

        beforeEach(function () {
            vm = new VariableManager();
        });

        it('handles setting a value', function () {
            expect(function () {
                vm.set('var 1', 'abcdef');
            }).not.toThrow();
        });

        it('throws in case wrong arguments are used in set', function () {
            expect(function () {
                vm.set('', 'abc');
            }).toThrowError();

            expect(function () {
                vm.set(123, 'abc');
            }).toThrowError();

            expect(function () {
                vm.set('abc', 123);
            }).toThrowError();
        });

        it('has returns true in case a value was set', function () {
            vm.set('cwd', process.cwd());
            expect(vm.has('cwd')).toBe(true);
        });

        it('has returns false in case a value was not set', function () {
            vm.set('cwd', process.cwd());
            expect(vm.has('cwd!!!')).toBe(false);
        });

        it('handles getting a value', function () {
            vm.set('var 1', 'abcdef');
            expect(function () {
                vm.get('var 1');
            }).not.toThrow();
            expect(vm.get('var 1')).toBe('abcdef');
        });

        it('throws in case wrong arguments are used in get', function () {
            expect(function () {
                vm.get(123);
            }).toThrowError();
        });

        it('throws in case variableName does not exist in get', function () {
            expect(function () {
                vm.get('');
            }).toThrowError();
        });

        it('handles setting multiple values', function () {
            expect(function () {
                vm.set('var 1', '123');
            }).not.toThrow();

            expect(function () {
                vm.set('var 2', '234');
            }).not.toThrow();

            expect(function () {
                vm.set('var 3', '345');
            }).not.toThrow();
        });

        it('handles getting multiple values', function () {
            vm.set('var 1', '123');
            vm.set('var 2', '234');
            vm.set('var 3', '345');

            expect(function () {
                vm.get('var 1');
            }).not.toThrow();

            expect(function () {
                vm.get('var 2');
            }).not.toThrow();

            expect(function () {
                vm.get('var 3');
            }).not.toThrow();

            expect(vm.get('var 1')).toBe('123');
            expect(vm.get('var 2')).toBe('234');
            expect(vm.get('var 3')).toBe('345');
        });

        it('has returns true in case multiple values were set', function () {
            vm.set('cwd', process.cwd());
            vm.set('hello', 'world');
            expect(vm.has('cwd')).toBe(true);
            expect(vm.has('hello')).toBe(true);
        });

        it('overrides existing value in case of multiple invocations of set', function () {
            expect(function () {
                vm.set('var 1', '1');
                vm.set('var 1', '2');
                vm.set('var 1', '3');
                vm.set('var 1', '4');
            }).not.toThrow();

            expect(vm.get('var 1')).toBe('4');
        });
    });

    describe ('when source parameter is present in constructor', function () {
        var vm;
        beforeEach(function () {
            var source = new VariableManager();
            source.set('var 1', 'value 1');
            source.set('hello', 'world!');
            source.set('cwd', process.cwd());

            vm = new VariableManager(source);
        });

        it('contains inherited variable', function () {
            expect(vm.has('var 1')).toBe(true);
            expect(vm.has('hello')).toBe(true);
            expect(vm.has('cwd')).toBe(true);
        });

        it('contains inherited variable with correct value', function () {
            expect(vm.get('var 1')).toBe('value 1');
            expect(vm.get('hello')).toBe('world!');
            expect(vm.get('cwd')).toBe(process.cwd());
        });

        it('can override inherited values', function () {
            vm.set('var 1', '123');
            expect(vm.get('var 1')).toBe('123');
            expect(vm.get('hello')).toBe('world!');
            expect(vm.get('cwd')).toBe(process.cwd());

            vm.set('hello', 'is there anybody?');
            expect(vm.get('var 1')).toBe('123');
            expect(vm.get('hello')).toBe('is there anybody?');
            expect(vm.get('cwd')).toBe(process.cwd());
        });
    });
});
