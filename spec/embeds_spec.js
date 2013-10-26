'use strict';

describe('Iguana.Embeds', function() {

    var Iguana, Item, SubItem;

    beforeEach(function() {
        module('Iguana');
        inject(function($injector, _Iguana_) {
            Iguana = _Iguana_;
            
            Item = Iguana.subclass(function() {
                this.embedsMany('subItems', 'SubItem');
            });
            
            SubItem = Iguana.subclass(function() {
                this.alias('SubItem');
                this.embeddedIn('item');
            });
        });
    });
    
    describe('embedsMany', function() {
        
        it('should instantiate instances of expected classes in an array', function() {
            var attrs = {
                subItems: [{a: 0}, {a: 1}]
            };
            var item = Item.new(attrs);
            angular.forEach(attrs.subItems, function(obj, i){
                var subitem = item.subItems[i];
                expect(subitem).not.toBeUndefined();
                expect(subitem.constructor).toBe(SubItem);
                expect(subitem.asJson()).toEqual(obj);
            });
            expect(item.asJson()).toEqual(attrs);
        });
        
        it('should instantiate instances of expected classes in an object', function() {
            var attrs = {
                subItems: {
                    one: {a: 0}, 
                    another: {a: 1}
                }
            };
            var item = Item.new(attrs);
            angular.forEach(attrs.subItems, function(obj, name){
                var subitem = item.subItems[name];
                expect(subitem).not.toBeUndefined();
                expect(subitem.constructor).toBe(SubItem);
                expect(subitem.asJson()).toEqual(obj);
            });
            expect(item.asJson()).toEqual(attrs);
        });
    
    });
    
    describe('embeddedIn', function() {
        it('should make the parent accessible to the embedded document', function() {
            var attrs = {
                subItems: [{a: 0}]
            };
            var item = Item.new(attrs);
            expect(item.subItems[0].item()).toBe(item);
        });
    });
    
});
