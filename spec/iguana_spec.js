'use strict';

describe('Iguana', function() {

    var Iguana, Item;

    beforeEach(function() {
        module('Iguana');

        inject(function(_Iguana_) {
            Iguana = _Iguana_;
            Item = Iguana.subclass();
        });

    });
    
    describe('initialize', function() {
        it('should copy provided attributes onto instance', function() {
            var item = Item.new({a: 1});
            expect(item.a).toBe(1);
        });
    });

    
});
