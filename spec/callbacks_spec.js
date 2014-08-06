'use strict';

describe('Iguana.Callbacks', function() {

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

    // # Callbacks
    // ### save
    // triggered on the sending of the 'save' action to the api
    describe('save', function() {
        it('should support callbacks', function() {
            var called = false;
            Item.setCallback('before', 'save', function() {
                called = true;
            });
            Item.expect('create', {}, {
                result: {}
            });
            Item.new({}).save();
            expect(called).toBe(true);
        });
    });

    // ### copyAttrs
    // Triggered when the properties of a vanilla object are copied
    // onto the instance.  This happens during initialize and after
    // *create* or *update* api calls return.
    describe('copyAttrs', function() {
        it('should support callbacks', function() {
            var calledCount = 0;
            Item.setCallback('before', 'copyAttrs', function() {
                calledCount = calledCount + 1;
            });
            Item.expect('create', {}, {
                result: {}
            });
            Item.new({}).save();
            expect(calledCount).toBe(1);
            Item.flush('create');
            expect(calledCount).toBe(2);
        });
    });

    // ### copyAttrsOnInitialize
    // Triggered when the properties of a vanilla object are copied
    // onto the instance, but only during initialize, not after
    // *create* or *update* calls return;
    describe('copyAttrsOnInitialize', function() {
        it('should support callbacks', function() {
            var calledCount = 0;
            Item.setCallback('before', 'copyAttrsOnInitialize', function() {
                calledCount = calledCount + 1;
            });
            Item.expect('create', {}, {
                result: {}
            });
            Item.new({}).save();
            expect(calledCount).toBe(1);
            Item.flush('create');
            expect(calledCount).toBe(1);
        });
    });


});