'use strict';

describe('Iguana.Alias', function() {

    var Iguana, Item, $injector;

    beforeEach(function() {
        module('Iguana');

        inject(function(_Iguana_, _$injector_) {
            Iguana = _Iguana_;
            $injector = _$injector_;
            Item = Iguana.subclass(function() {
                this.alias('item');
            });
        });

    });

    describe('alias', function() {
        it('should return the alias if no arg is passed in', function() {
            expect(Item.alias()).toBe('item');
        });
    });

    describe('getAliasedKlass', function() {
        it('should find an aliased class', function() {
            expect(Iguana.getAliasedKlass('item')).toBe(Item);
        });

        it('should find an aliased class when called on a subclass', function() {
            expect(Item.getAliasedKlass('item')).toBe(Item);
        });

        it('should use the injectorMap to find a class that has not yet been loaded', function() {
            var mockClass = Iguana.subclass(function() {
                this.alias('alias');
            });
            var get = $injector.get;
            spyOn($injector, 'get').and.callFake(function(path) {
                if (path === 'MyClass') {
                    return mockClass;
                } else {
                    return get(path);
                }
            });
            Iguana.mapInjectables({
                alias: 'MyClass'
            });
            expect(Iguana.getAliasedKlass('alias')).toBe(mockClass);
        });

        it('should throw if class in injector map has unexpected alias', function() {
            var mockClass = Iguana.subclass(function() {
                this.alias('unexpected');
            });
            var get = $injector.get;
            spyOn($injector, 'get').and.callFake(function(path) {
                if (path === 'MyClass') {
                    return mockClass;
                } else {
                    return get(path);
                }
            });
            Iguana.mapInjectables({
                alias: 'MyClass'
            });
            // setting second argument to false because this should
            // throw even if throwOnUnfound is false
            expect(function() {
                Iguana.getAliasedKlass('alias', false)
            }).toThrow(new Error('Class included in injectablesMap does not have the expected alias: "unexpected" != "alias"'));
        });
    });


});