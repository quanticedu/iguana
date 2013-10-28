'use strict';

describe('Iguana.Alias', function() {

    var Iguana, Item;

    beforeEach(function() {
        module('Iguana');

        inject(function(_Iguana_) {
            Iguana = _Iguana_;
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
    });

    
});
