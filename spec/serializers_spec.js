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
        // ### asJson
        // 'asJson' returns an object following the rules
        // that angular.toJson uses.  This means that 
        // properties whose names start with $ or whose values
        // are functions will be removed, and everything else
        // will be converted to json formats.
        it('should return an object', function() {
            var obj = {
                someString: 'value',
                someNumber: 1.4,
                someArray: [1,2,3,4],
                someDate: new Date(2013,1,1),
                someObject: {a: 1},
                $$ignoreThisProp: 'ignored',
                ignoreThisFunction: function() {}
            };
            var item = Item.new(obj);
            expect(item.asJson()).toEqual({
                someString: 'value',
                someNumber: 1.4,
                someArray: [1,2,3,4],
                someDate: '2013-02-01T05:00:00.000Z',
                someObject: {a: 1}
            });
        });
    })
    
    /* ### toJson
    This one is just
    
        return angular.toJson(this);
        */
    describe('toJson', function() {
        it('should return a string', function() {
            expect(Item.new({a: 1}).toJson()).toEqual('{"a":1}');
        });
    });

    
});
