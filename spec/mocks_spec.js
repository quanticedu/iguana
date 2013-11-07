'use strict';

describe('IguanaMock', function() {
    
    var myApp, Iguana, Item, $controller, scope, $window;
    
    beforeEach(function() {
        
        // # Testing
        // The dist folder of iguana includes a file for use in testing called iguana-mock.js.
        // You will need to include that file when running tests in order to use the features 
        // described here.
        myApp = angular.module('myApp', ['Iguana']);

        myApp.factory('Item', function(Iguana){
            
            return Iguana.subclass(function() {
                this.setCollection('items');
            });
            
        });

        // The following examples test a controller that handles all of
        // the api calls for our Item model
        myApp.controller('ItemController', function(Item, $scope, $window){
            
            $scope.itemList = [];
            $scope.item = null;
            
            function onError(error) {
                $window.alert(error.message);
            }
            
            this.show = function(id) {
                return Item.show(id).then(
                    //success callback
                    function(response){
                        $scope.item = response.result;
                        if(response.meta) {
                            $window.alert(response.meta.message);
                        }
                    }, 
                    //error callback
                    onError
                );
            };
            
            this.index = function(query) {
                return Item.index(query).then(
                    //success callback
                    function(response){
                        $scope.itemList = response.result;
                        if(response.meta) {
                            $window.alert(response.meta.message);
                        }
                    }, 
                    //error callback
                    onError
                );
            };
            
            this.create = function(attrs) {
                attrs = attrs || {};
                $scope.item = Item.new(attrs);
                this.save();
            }
            
            this.save = function() {
                if ($scope.item) {
                    return $scope.item.save().then(
                        //success callback
                        function(response){
                            $window.alert("Item saved!");
                            if(response.meta) {
                                $window.alert(response.meta.message);
                            }
                        }, 
                        //error callback
                        onError
                    );
                }
            };
            
            this.destroy = function() {
                if ($scope.item) {
                    return $scope.item.destroy().then(
                        //success callback
                        function(response){
                            $scope.item = null;
                            $window.alert("Item deleted!");
                            if(response.meta) {
                                $window.alert(response.meta.message);
                            }
                        }, 
                        //error callback
                        onError
                    );
                }
            };
        }); 
        
        module('myApp');
        
        // ### Setup
        // Make sure to inject MockIguana, which will add some helper
        // methods (i.e. 'expect') onto all Iguana classes.  You don't need
        // to do anything with MockIguana; simply injecting it is sufficient     
        inject(function(_Iguana_, _Item_, _$controller_, $rootScope, MockIguana, _$window_){
            Iguana = _Iguana_;
            $controller = _$controller_;
            scope = $rootScope.$new();
            Item = _Item_;
            $window = _$window_;
            spyOn($window, 'alert');
            
            // Use the mock adapter, which will 
            // allow you to mock out all of the api calls.
            Iguana.setAdapter('Iguana.Mock.Adapter');
            
        });
        

        
    });
    
    
    // ## Mocking Basics
    it('should work with expect/call/fush', function() {
        // In most cases, making mock api calls will involve 3 steps.     
        var controller = $controller("ItemController", {$scope: scope});
        // First, call expect() to indicate that you expect a method to be called ...
        Item.expect('show');
        // ... then, run your code that is going to call the method ...
        controller.show('id');
        // ... and last, call flush() to mock out the returning of the request.
        Item.flush('show');
        expect(scope.item).not.toBe(null);
        expect(scope.item.constructor).toBe(Item);
    });
    
    // ## Show
    describe('mocking show', function() {
        
        // ### Basic expect/call/flush
        it('should work with no special features set', function() {  
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show');
            controller.show('id');
            Item.flush('show');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
        });
        
        // ### toBeCalledWith
        // You can indicate the arguments you expect to be passed to the
        // method with _toBeCalledWith_
        it('should work with toBeCalledWith', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show').toBeCalledWith('someId');
            controller.show('someId');
            Item.flush('show');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
        });
        
        // ### returns
        // You can indicate the response that comes back from the server
        it('should work with returns and a full response', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show').returns({
                result: {foo: 'bar'}, 
                meta: {message: 'some metadata came back'}
            });
            controller.show('id');
            Item.flush('show');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect(scope.item.foo).toBe('bar');
            expect($window.alert).toHaveBeenCalledWith('some metadata came back');
        });
        
        // If you don't expect any metadata, then you can just pass the result
        // to _returns_
        it('should work with returns and just a result hash', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show').returns({foo: 'bar'});
            controller.show('id');
            Item.flush('show');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect(scope.item.foo).toBe('bar');
            expect($window.alert).not.toHaveBeenCalled();
        });        
        
        // You can pass an instance instead of a hash to returns
        it('should work with returns and just a result instance', function() {
            var controller = $controller("ItemController", {$scope: scope});
            var item = Item.new({foo: 'bar'});
            Item.expect('show').returns(item);
            controller.show('id');
            Item.flush('show');
            expect(scope.item).not.toBe(null);
            expect(scope.item.foo).toBe('bar');
            
            // Note: the instance that comes back has the same attributes
            // as the instance that was passed in, but it is not
            // the same object.
            expect(scope.item).not.toBe(item);
            expect(scope.item).toEqual(item);
        });
        
        // ## returnsMeta
        // If you just care about the metadata, then you can set it with
        // _returnsMeta_
        it('should work with returnsMeta', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show').returnsMeta({message: 'some metadata came back'});
            controller.show('id');
            Item.flush('show');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect($window.alert).toHaveBeenCalledWith('some metadata came back');
        });
        
        // ## fails
        // If you want the api call to fail, you can call _fail_
        it('should work with fail', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show').fails({message: 'An Error'});
            controller.show('id');
            Item.flush('show');
            expect(scope.item).toBe(null);
            expect($window.alert).toHaveBeenCalledWith('An Error');
        });
        
    });
    
    // ## Index
    describe('mocking index', function() {
        
        // ### Basic expect/call/flush
        it('should work with no special features set', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('index');
            controller.index();
            Item.flush('index');
            expect(scope.itemList).not.toEqual([]);
            expect(scope.itemList[0].constructor).toBe(Item);
        });
        
        // ### toBeCalledWith
        // You can indicate the arguments you expect to be passed to the
        // method with _toBeCalledWith_
        it('should work with toBeCalledWith', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('index').toBeCalledWith('someQuery');
            controller.index('someQuery');
            Item.flush('index');
            expect(scope.itemList).not.toEqual([]);
            expect(scope.itemList[0].constructor).toBe(Item);
        });
        
        // ### returns
        // You can indicate the response that comes back from the server
        it('should work with returns and a full response', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('index').returns({
                result: [{foo: 'bar'}], 
                meta: {message: 'some metadata came back'}
            });
            controller.index();
            Item.flush('index');
            expect(scope.itemList).not.toEqual([]);
            expect(scope.itemList[0].constructor).toBe(Item);
            expect(scope.itemList[0].foo).toBe('bar');
            expect($window.alert).toHaveBeenCalledWith('some metadata came back');
        });
        
        // If you don't expect any metadata, then you can just pass the result
        // to _returns_
        it('should work with returns and just a result hash', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('index').returns([{foo: 'bar'}]);
            controller.index('id');
            Item.flush('index');
            expect(scope.itemList).not.toEqual([]);
            expect(scope.itemList[0].constructor).toBe(Item);
            expect(scope.itemList[0].foo).toBe('bar');
            expect($window.alert).not.toHaveBeenCalled();
        });        
        
        // You can pass a list of instances instead of a hash to returns
        it('should work with returns and just a list of result instances', function() {
            var controller = $controller("ItemController", {$scope: scope});
            var items = [Item.new({foo: 'bar'})];
            var ex = Item.expect('index').returns(items);
            controller.index();
            Item.flush('index');
            expect(scope.itemList).not.toEqual([]);
            expect(scope.itemList[0].constructor).toBe(Item);
            expect(scope.itemList[0].foo).toBe('bar');
            
            // Note: the instance that comes back has the same attributes
            // as the instance that was passed in, but it is not
            // the same object.
            expect(scope.itemList[0]).not.toBe(items[0]);
            expect(scope.itemList[0]).toEqual(items[0]);
        });
        
        // ## returnsMeta
        // If you just care about the metadata, then you can set it with
        // _returnsMeta_
        it('should work with returnsMeta', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('index').returnsMeta({message: 'some metadata came back'});
            controller.index();
            Item.flush('index');
            expect(scope.itemList).not.toEqual([]);
            expect(scope.itemList[0].constructor).toBe(Item);
            expect($window.alert).toHaveBeenCalledWith('some metadata came back');
        });
        
        // ## fails
        // If you want the api call to fail, you can call _fail_
        it('should work with fail', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('index').fails({message: 'An Error'});
            controller.index();
            Item.flush('index');
            expect(scope.itemList).toEqual([]);
            expect($window.alert).toHaveBeenCalledWith('An Error');
        });
        
    });    


    // ## Create and Update
    describe('mocking create and update', function() {
        
        // ### Basic expect/call/flush with create
        it('create should work with no special features set', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('create');
            controller.create();
            Item.flush('create');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect($window.alert).toHaveBeenCalledWith('Item saved!');
        });
        
        // ### Basic expect/call/flush with update
        it('update should work with no special features set', function() {
            var controller = $controller("ItemController", {$scope: scope});
            //load up an item
            Item.expect('show').returns({id: 'id'});
            controller.show('someid');
            Item.flush('show');
            
            //update it
            Item.expect('update');
            controller.save();
            Item.flush('update');
            
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect($window.alert).toHaveBeenCalledWith('Item saved!');
        });
        
        // ### Basic expect/call/flush with save
        // If you don't care what kind of save is called (either
        // create or update are both ok?)
        it('save should work with no special features set', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('save').returns({id: 'id'});
            controller.create();
            Item.flush('save');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect($window.alert).toHaveBeenCalledWith('Item saved!');
            
            Item.expect('save');
            controller.save();
            Item.flush('save');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect($window.alert.calls.length).toBe(2);
        });
        
        // ### returns
        // In general, there is no need to indicate the return value,
        // because the server usually will return the same item that was saved.
        it('should return the item that was passed in', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('save');
            controller.create({foo: 'bar'});
            Item.flush('save');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect(scope.item.foo).toBe('bar');
            expect($window.alert).toHaveBeenCalledWith('Item saved!');
        });
        
        // But, if you expect the server to make changes to the item, then
        // you can use returns to indicate that 
        it('should return the item that was passed in', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('save').returns({foo: 'bar', serverAddedThis: true});
            controller.create({foo: 'bar'});
            Item.flush('save');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect(scope.item.foo).toBe('bar');
            expect(scope.item.serverAddedThis).toBe(true);
            expect($window.alert).toHaveBeenCalledWith('Item saved!');
        });

        // ## returnsMeta
        // If you're fine with the default return value, but
        // you want to set the metadata, you can use
        // _returnsMeta_
        it('should work with returnsMeta', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('save').returnsMeta({message: 'some metadata came back'});
            controller.create();
            Item.flush('save');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            expect($window.alert).toHaveBeenCalledWith('some metadata came back');
            expect($window.alert).toHaveBeenCalledWith('Item saved!');
        });
        
        // ## fails
        // If you want the api call to fail, you can call _fail_
        it('should work with fail', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('save').fails({message: 'An Error'});
            controller.create();
            Item.flush('save');
            expect($window.alert).toHaveBeenCalledWith('An Error');
        });
        
    });  
    
    // ## Destroy
    describe('mocking destroy', function() {
        
        // ### Basic expect/call/flush
        it('should work with no special features set', function() {  
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show');
            controller.show('id');
            Item.flush('show');
            expect(scope.item).not.toBe(null);
            expect(scope.item.constructor).toBe(Item);
            
            Item.expect('destroy');
            controller.destroy();
            Item.flush('destroy');
            expect(scope.item).toBe(null);
            expect($window.alert).toHaveBeenCalledWith('Item deleted!');
        });
        
        // ### toBeCalledWith
        // You can indicate the arguments you expect to be passed to the
        // method with _toBeCalledWith_
        it('should work with toBeCalledWith', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show').returns({id: 'someid'});
            controller.show('id');
            Item.flush('show');
            
            Item.expect('destroy').toBeCalledWith('someid');
            controller.destroy();
            Item.flush('destroy');
            expect(scope.item).toBe(null);
            expect($window.alert).toHaveBeenCalledWith('Item deleted!');
        });
        
        // ### returns
        // Destroy always returns an empty result, so you cannot 
        // pass a result to returns
        it('should work with returns and a full response', function() {
            var controller = $controller("ItemController", {$scope: scope});
            expect(function(){
                Item.expect('destroy').returns({foo: 'bar'});
            }).toThrow('destroy always returns an empty result, so you cannot mock out a different result.');
        });
        
        // ## returnsMeta
        // You can set the metadata that cose back with _returnsMeta_
        it('should work with returnsMeta', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show').returns({id: 'someid'});
            controller.show('id');
            Item.flush('show');
            
            Item.expect('destroy').returnsMeta({message: 'some metadata came back'});
            controller.destroy();
            Item.flush('destroy');
            expect(scope.item).toBe(null);
            expect($window.alert).toHaveBeenCalledWith('Item deleted!');
            expect($window.alert).toHaveBeenCalledWith('some metadata came back');
        });
        
        // ## fails
        // If you want the api call to fail, you can call _fail_
        it('should work with fail', function() {
            var controller = $controller("ItemController", {$scope: scope});
            Item.expect('show').returns({id: 'someid'});
            controller.show('id');
            Item.flush('show');
            
            Item.expect('destroy').fails({message: 'An Error'});
            controller.destroy();
            Item.flush('destroy');
            expect(scope.item).not.toBe(null);
            expect($window.alert).toHaveBeenCalledWith('An Error');
        });
        
    });  
    
});