'use strict';

describe('Iguana.SingleCollectionInheritance', function() {
    
    var Iguana, Item;
    
    beforeEach(function() {
        module('Iguana');

        inject(function(_Iguana_) {
            Iguana = _Iguana_;
            Iguana.setAdapter('Iguana.Mock.Adapter');
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
                    this.setCollection('items');
                });
                
                ItemType1 = Item.subclass(function() {
                    this.alias('item_type_1');
                });
                
                ItemType2 = Item.subclass(function() {
                    this.alias('item_type_2');
                });
            });

        });
        
        // Now that you have called alias(), when a document 
        // is loaded up over the api, it will be instantiated
        // as instance of the appropriate class.
        it('should create an instance of a subclass if the type property matches the alias', function() {
            // ...
            //There are two items in the database
            var items = [
                {id: 1, __iguana_type: 'item_type_1'},
                {id: 2, __iguana_type: 'item_type_2'}];
            
            //Mocking out the adapter to load up the first item.
            Item.adapter().expect('show', 'items', 1, {result: [items[0]]});
            Item.show(1).then(function(response){
                var item = response.result;
                
                //Since the __iguana_type is 'item_type_1', the result is 
                //an instance of ItemType1
                expect(item.constructor).toBe(ItemType1);
            });
            
            //Mocking out the adapter to load up the second item.
            Item.adapter().expect('show', 'items', 2, {result: [items[1]]});
            Item.show(2).then(function(response){
                var item = response.result;
                
                //Since the __iguana_type is 'item_type_2', the result is 
                //an instance of ItemType2
                expect(item.constructor).toBe(ItemType2);
            });
        });
        
        // When a new instance is created, the \_\_iguana\_type is set automatically.
        it('should create an instance of the class and set the __iguana_type if the __iguana_type is not set', function() { 
            // ...
            var instance = ItemType1.new({});
            expect(instance.constructor).toBe(ItemType1);
            expect(instance.__iguana_type).toBe('item_type_1');
        });
        
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
                this.setCollection('items');
                this.setSciProperty('item_type');
            });
            
            var ItemType1 = Item.subclass(function() {
                this.alias('item_type_1');
            });
            
            var ItemType2 = Item.subclass(function() {
                this.alias('item_type_2');
            });
            
            // Since we called setSciProperty('itemType'), we should
            // use the itemType property to define the alias of the 
            // class used to instantiate the document.
            var item = {id: 1, item_type: 'item_type_1'};
            
            //Mocking out the adapter to load up the item.
            Item.adapter().expect('show', 'items', 1, {result: [item]});
            Item.show(1).then(function(response){
                var loadedItem = response.result;
                
                //Since the __iguana_type is 'item_type_1', the result is 
                //an instance of ItemType1
                expect(loadedItem.constructor).toBe(ItemType1);
            });
        });
        
    });

    
});
