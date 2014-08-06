'use strict';

describe('Iguana.Keys', function() {

    var Iguana, Item;

    beforeEach(function() {
        module('Iguana');

        inject(function(MockIguana, _Iguana_) {
            Iguana = _Iguana_;
            Item = Iguana.subclass(function() {
                this.setCollection('items');
            });
        });

    });

    // # Keys
    // ### defineSetter
    // Used to define a setter on an attribute for a record
    describe('defineSetter', function() {

        // In this case we call some side effect whenever the
        // value is updated and then 
        // use writeKey to actually update the value
        it('should support defining a set function for a key', function() {

            var sideEffect = jasmine.createSpy('sideEffect');
            Item.defineSetter('myKey', function(val) {
                if (val === this.myKey) {
                    return val;
                }
                sideEffect(val);
                this.writeKey('myKey', val);
                return val;
            });

            // the setter is not called when the item is initialized
            var item = Item.new({
                myKey: 'value'
            });

            // but it is called when the value is updated
            item.myKey = 'a new value';

            expect(sideEffect).toHaveBeenCalled();
            expect(item.myKey).toBe('a new value');

        });


    });


});