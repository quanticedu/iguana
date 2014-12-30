'use strict';

describe('Iguana.Crud', function() {

    var Item;

    beforeEach(function() {
        module('Iguana');
        inject(function($injector, _Iguana_) {
            var Iguana = _Iguana_;
            Item = Iguana.subclass(function() {
                this.setCollection("items");
            });
            Iguana.setAdapter('Iguana.Mock.Adapter');
        });
    });
    
    describe('ClassMethod show', function() {
        
        it('should make an api call and process the result', function() {
            assertMakesApiCallAndReturnsASingleInstance('show', ['arg1', 'arg2']);
        });
        
        it('should make an api call and handle an error', function() {
            assertMakesApiCallAndFiresErrorCallback('show', ['arg1', 'arg2']);
        });
        
    });
    
    describe('ClassMethod index', function() {
        
        it('should make an api call and process the result', function() {
            assertMakesApiCallAndReturnsAnArrayOfInstances('index', ['arg1', 'arg2']);
        });
        
        it('should make an api call and handle an error', function() {
            assertMakesApiCallAndFiresErrorCallback('index', ['arg1', 'arg2']);
        });
    });
    
    describe('ClassMethod create', function() {
        
        it('should make an api call and process the result', function() {
            assertMakesApiCallAndReturnsASingleInstance('create', [{}]);
        });
        
        it('should make an api call and handle an error', function() {
            assertMakesApiCallAndFiresErrorCallback('create', [{}]);
        });
    });
    
    describe('ClassMethod update', function() {
        
        it('should make an api call and process the result', function() {
            assertMakesApiCallAndReturnsASingleInstance('update', [{id: 'id'}]);
        });
        
        it('should make an api call and handle an error', function() {
            assertMakesApiCallAndFiresErrorCallback('update', [{id: 'id'}]);
        });
    });
    
    describe('ClassMethod destroy', function() {
        
        it('should make an api call and process the result', function() {
            assertMakesApiCallAndReturnsNothing('destroy', ['id']);
        });
        
        it('should make an api call and handle an error', function() {
            assertMakesApiCallAndFiresErrorCallback('destroy', ['id']);
        });
    });
    
    describe('InstanceMethod save', function() {
        it('should create a new item', function() {
            var item = Item.new({});
            assertSavesAndFiresSuccessCallback(item, 'create');            
        });
        
        it('should update an existing item', function() {
            var item = Item.new({id: 'id'});
            assertSavesAndFiresSuccessCallback(item, 'update');
        });
        
        it('should pass metadata along', function() {
            var item = Item.new();
            var mockPromise = {
                then: function() {
                    return mockPromise;
                },
                finally: function() {}
            };
            spyOn(Item.adapter(), 'create').andReturn(mockPromise);
            var metadata = {meta: 'data'};
            item.save(metadata);
            expect(Item.adapter().create).toHaveBeenCalled();
            expect(Item.adapter().create.calls[0].args[2]).toBe(metadata);
        });
        
        it('should fire error when creating a new item', function() {
            var item = Item.new({});
            assertFiresErrorCallbackOnSave(item, 'create');
        });
        
        it('should fire error when updating an existing item', function() {
            var item = Item.new({id: 'id'});
            assertFiresErrorCallbackOnSave(item, 'update');
        });

        it('should set the saving flag while saving', function() {
            var item = Item.new({id: 'id'});
            Item.adapter().expect('update');
            item.save();
            expect(item.$$saving).toBe(true);
            Item.adapter().flush('update');
            expect(item.$$saving).toBe(false);
        });

        it('should unset the saving flag on error', function() {
            var item = Item.new({id: 'id'});
            Item.adapter().expect('update', 'items', [item.asJson()], {error: 'error'});    
            item.save();
            expect(item.$$saving).toBe(true);
            Item.adapter().flush('update');
            expect(item.$$saving).toBe(false);
        });
        
        function assertSavesAndFiresSuccessCallback(item, action) {
            var toBeSpiedOn = {onSuccess: function(response){
                expect(response.result).toBe(item);
                expect(response.meta).toBe('meta');
            }};                        
            spyOn(toBeSpiedOn, 'onSuccess').andCallThrough();
    
            Item.adapter().expect(action, 'items', [item.asJson()], {result: [item.asJson()], meta: 'meta'});
    
            item.save().then(toBeSpiedOn.onSuccess);
            expect(toBeSpiedOn.onSuccess).not.toHaveBeenCalled(); // results have not come back from the server yet
            Item.adapter().flush(action);
            expect(toBeSpiedOn.onSuccess).toHaveBeenCalled();
        }
        
        function assertFiresErrorCallbackOnSave(item, action) {
            var error = {message: 'message'};
            var toBeSpiedOn = {onError: null};                        
            spyOn(toBeSpiedOn, 'onError');
    
            Item.adapter().expect(action, 'items', [item.asJson()], {error: error});
    
            item.save().catch(toBeSpiedOn.onError);
            expect(toBeSpiedOn.onError).not.toHaveBeenCalled(); // results have not come back from the server yet
            Item.adapter().flush(action);
            expect(toBeSpiedOn.onError).toHaveBeenCalled();
        }
    });
    
    describe('InstanceMethod destroy', function() {
        it('should destroy an instance and call success', function() {
            var toBeSpiedOn = {onSuccess: function(response){
                expect(response.result).toBe(null);
                expect(response.meta).toBe('meta');
            }};                        
            spyOn(toBeSpiedOn, 'onSuccess').andCallThrough();
    
            var item = Item.new({id: 'id'});
            Item.adapter().expect('destroy', 'items', ['id'], {result: [], meta: 'meta'});            
            item.destroy().then(toBeSpiedOn.onSuccess);
            
            expect(toBeSpiedOn.onSuccess).not.toHaveBeenCalled(); // results have not come back from the server yet
            Item.adapter().flush('destroy');
            expect(toBeSpiedOn.onSuccess).toHaveBeenCalled();
        });
        
        it('should fire an error when failing to destroy', function() {
            var error = {message: 'message'};
            var toBeSpiedOn = {onError: null};                        
            spyOn(toBeSpiedOn, 'onError');
    
            var item = Item.new({id: 'id'});
            Item.adapter().expect('destroy', 'items', ['id'], {error: 'error'});            
            item.destroy().catch(toBeSpiedOn.onError);
            
            expect(toBeSpiedOn.onError).not.toHaveBeenCalled(); // results have not come back from the server yet
            Item.adapter().flush('destroy');
            expect(toBeSpiedOn.onError).toHaveBeenCalledWith('error');
        });

        it('should set the destroying and saving flags while saving', function() {
            var item = Item.new({id: 'id'});
            Item.adapter().expect('destroy');
            item.destroy();
            expect(item.$$destroying).toBe(true);
            expect(item.$$saving).toBe(true);
            Item.adapter().flush('destroy');
            expect(item.$$destroying).toBe(false);
            expect(item.$$saving).toBe(false);
        });

        it('should unset the destroying and saving flags on error', function() {
            var item = Item.new({id: 'id'});
            Item.adapter().expect('destroy', 'items', ['id'], {error: 'error'});
            item.destroy();
            expect(item.$$destroying).toBe(true);
            expect(item.$$saving).toBe(true);
            Item.adapter().flush('destroy');
            expect(item.$$destroying).toBe(false);
            expect(item.$$saving).toBe(false);
        });
    });
    
    function assertMakesApiCallAndReturnsNothing(meth, args) {
        assertMakesApiCallAndFiresSuccessCallback(meth, args, [], function(response){
            expect(response.result).toBe(null);
            expect(response.meta).toBe('meta');
        });
    }
    
    function assertMakesApiCallAndReturnsASingleInstance(meth, args) {
        var attrs = {id: 'id'};
        assertMakesApiCallAndFiresSuccessCallback(meth, args, [attrs], function(response){
            var item = response.result;
            expect(item.asJson()).toEqual(attrs);
            expect(item.constructor).toBe(Item);
            expect(response.meta).toBe('meta');
        });
    }
    
    function assertMakesApiCallAndReturnsAnArrayOfInstances(meth, args) {
        var attrs = [{id: 'id1'}, {id: 'id2'}];
        assertMakesApiCallAndFiresSuccessCallback('index', args, attrs, function(response) {
            var items = response.result;
            var json = [];
            angular.forEach(items, function(item){
                expect(item.constructor).toBe(Item);
                json.push(item.asJson());
            });
            expect(json).toEqual(attrs);                
            expect(response.meta).toBe('meta');
        });
    }

    function assertMakesApiCallAndFiresSuccessCallback(meth, args, returnAttrs, success) {
        var toBeSpiedOn = {onSuccess: success};                        
        spyOn(toBeSpiedOn, 'onSuccess').andCallThrough();
        
        Item.adapter().expect(meth, 'items', args, {result: returnAttrs, meta: 'meta'});
        
        Item[meth].apply(Item, args).then(toBeSpiedOn.onSuccess);
        expect(toBeSpiedOn.onSuccess).not.toHaveBeenCalled(); // results have not come back from the server yet
        Item.adapter().flush(meth);
        expect(toBeSpiedOn.onSuccess).toHaveBeenCalled();
    }
    
    function assertMakesApiCallAndFiresErrorCallback(meth, args) {
        var error = {message: 'message'};
        var toBeSpiedOn = {onError: null};                        
        spyOn(toBeSpiedOn, 'onError');
        
        Item.adapter().expect(meth, 'items', args, {error: error});
        
        Item[meth].apply(Item, args).catch(toBeSpiedOn.onError);
        expect(toBeSpiedOn.onError).not.toHaveBeenCalled(); // results have not come back from the server yet
        Item.adapter().flush(meth);
        expect(toBeSpiedOn.onError).toHaveBeenCalledWith(error);
    }


    
});
