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
                    // success callback
                    function(response){
                        $scope.item = response.result;
                        if(response.meta) {
                            $window.alert(response.meta.message);
                        }
                    }, 
                    onError
                );
            };
            
            this.index = function(query) {
                return Item.index(query).then(
                    // success callback
                    function(response){
                        $scope.itemList = response.result;
                        if(response.meta) {
                            $window.alert(response.meta.message);
                        }
                    }, 
                    onError
                );
            };
            
            this.save = function() {
                if ($scope.item) {
                    return $scope.item.save().then(
                        // success callback
                        function(response){
                            $window.alert("Item saved!");
                            if(response.meta) {
                                $window.alert(response.meta.message);
                            }
                        }, 
                        onError
                    );
                }
            };
            
            this.destroy = function() {
                if ($scope.item) {
                    return $scope.item.destroy().then(
                        // success callback
                        function(response){
                            $window.alert("Item deleted!");
                            if(response.meta) {
                                $window.alert(response.meta.message);
                            }
                        }, 
                        onError
                    );
                }
            };
        }); 
        
        module('myApp');
        
        // *** Setup
        // Make sure to inject MockIguana, which will add some helper
        // methods (i.e. 'expect') onto all Iguana classes.        
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
    
    
    // ## Mocking Show
    describe('mocking show', function() {
        
        // ### Basics
        it('should work with no special features set', function() {
            // In most cases, making mock api calls will involve 3 steps.     
            var controller = $controller("ItemController", {$scope: scope});
            // First, call expect() to indicate that you expect a method to be called ...
            Item.expect('show');
            // ... then, run your code that is going to call the method ...
            controller.show('id');
            // ... and last, call flush() to pretend like the http call returned and resolve the promise.
            Item.flush('show');
            expect(scope.item).not.toBeUndefined();
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
            expect(scope.item).not.toBeUndefined();
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
            expect(scope.item).not.toBeUndefined();
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
            expect(scope.item).not.toBeUndefined();
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
            expect(scope.item).not.toBeUndefined();
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
            expect(scope.item).not.toBeUndefined();
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
    
    // ## Mocking Index
    describe('mocking index', function() {
        
        // ### Basics
        it('should work with no special features set', function() {
            // In most cases, making mock api calls will involve 3 steps.     
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
    
    
});