'use strict';

describe('Iguana.SingleCollectionInheritance', function() {
    
    var Iguana, Item;
    
    beforeEach(function() {
        module('Iguana');

        inject(function(_Iguana_) {
            Iguana = _Iguana_;
        });

    });
    
    describe('new', function() {
        var ItemType1, ItemType2;
        
        beforeEach(function() {

            // # Single Collection Inheritance
            // You may have different documents in a single collection that
            // you want to be mapped to different classes.  This is known as
            // "ploymorphism" or "single collection inheritance."  
            //   
            // In order to implement single collection inheritance, you 
            // will need to set [aliases](alias_spec.html) for your classes.
            // Doing so will cause a property to be added to each document (by default,
            // the property is \_\_iguana_type), 
            // indicating which class it should be mapped to.  This allows
            // iguana to map each document to the appropriate class.
            inject(function() {
                // ...
                Item = Iguana.subclass(function() {
                    this.alias('item');
                });
                
                ItemType1 = Item.subclass(function() {
                    this.alias('itemtype1');
                });
                
                ItemType2 = Item.subclass(function() {
                    this.alias('itemtype2');
                });
            });

        });
        
        // Now that you have called alias(), when a document 
        // is instantiated that already has the \_\_iguana_type
        // property set, the class will
        // be chosen based on the value of the \_\_iguana\_type property.  This
        // will generally be the case when loading documents up over the api
        // via 'show' or 'index'.
        it('should create an instance of a subclass if the type property matches the alias', function() {
            // ...
            var instance1 = Item.new({__iguana_type: 'itemtype1'});
            expect(instance1.constructor).toBe(ItemType1);
            
            var instance2 = Item.new({__iguana_type: 'itemtype2'});
            expect(instance2.constructor).toBe(ItemType2);
        });
        
        // When a document does not have the \_\_iguana\_type property,
        // it will be set automatically.
        it('should create an instance of the class and set the __iguana_type if the __iguana_type is not set', function() { 
            // ...
            var instance = ItemType1.new({});
            expect(instance.constructor).toBe(ItemType1);
            expect(instance.__iguana_type).toBe('itemtype1');
        });
        
        // An error will be thrown if the \_\_iguana\_type property is set to
        // a class that cannot be found.
        it('should throw an error if no class matches the __iguana_type property', function() {
            // ...
            var func = function() {
                Item.new({__iguana_type: 'noItemForThis'});
            };
            expect(func).toThrow('No class could be found for __iguana_type="noItemForThis".');
        });
        
        it('should not set the type property if there is no alias', function() { 
            var UnAliasedItem = Iguana.subclass();
            var instance = UnAliasedItem.new({});
            expect(instance.constructor).toBe(UnAliasedItem);
            expect(instance.__iguana_type).toBeUndefined();
        });
        
        it('should create an instance of the class if the type property matches the sciAlias', function() {
            var instance = Item.new({__iguana_type: 'item'});
            expect(instance.constructor).toBe(Item);
        });
        
    });
    
    describe('sciProperty', function() {
        
        it('should default to __iguana_type', function() {
            expect(Iguana.sciProperty).toBe('__iguana_type');
            expect(Iguana.subclass().sciProperty).toBe('__iguana_type');
        });
        
        // ### Configuring the property used for the alias.
        // If you want to use something other than '__iguana_type' for
        // the property that defines the alias, you can use 'setSciProperty'.
        it('should be overridable', function() {
            var Item = Iguana.subclass(function() {
                this.alias('item');
                this.setSciProperty('itemType');
            });
            
            var ItemType1 = Item.subclass(function() {
                this.alias('itemtype1');
            });
            
            var ItemType2 = Item.subclass(function() {
                this.alias('itemtype2');
            });
            
            // Since we called setSciPropert('itemType'), we should
            // use the itemType property to define the alias of the 
            // class used to instantiate the document.
            var instance1 = Item.new({itemType: 'itemtype1'});
            expect(instance1.constructor).toBe(ItemType1);
        });
        
    });

    
});
