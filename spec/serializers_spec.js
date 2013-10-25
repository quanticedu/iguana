'use strict';

describe('Iguana.Serializers', function() {

    var Iguana, Item;

    beforeEach(function() {
        module('Iguana');

        inject(function(_Iguana_) {
            Iguana = _Iguana_;
            Item = Iguana.subclass();
        });

    });
    
    describe('asJson', function() {
        it('should return an object', function() {
            var obj = {a: 1, b: 2};
            var item = Item.new(obj);
            expect(item.asJson()).toEqual(obj);
        });
    })

    
});
