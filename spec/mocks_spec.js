'use strict';

describe('IguanaMock', function() {
    
    var myApp, Iguana, Item, $controller, scope;
    
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
            $scope.item = false;
            
            function onError(error) {
                $window.alert(error.message);
            }
            
            this.show = function(id) {
                return Item.show(response).then(
                    // success callback
                    function(item){
                        $scope.item = response.result;
                    }, 
                    onError
                );
            };
            
            this.index = function() {
                return Item.index().then(
                    // success callback
                    function(response){
                        $scope.itemList = response.result;
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
                        }, 
                        onError
                    );
                }
            };
            
            this.destroy = function() {
                if ($scope.item) {
                    return $scope.item.destroy().then(
                        // success callback
                        function(){
                            $window.alert("Item deleted!");
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
        inject(function(_Iguana_, _Item_, _$controller_, $rootScope, MockIguana){
            Iguana = _Iguana_;
            $controller = _$controller_;
            scope = $rootScope.$new();
            Item = _Item_;
            
            // Use the mock adapter, which will 
            // allow you to mock out all of the api calls.
            Iguana.setAdapter('Iguana.Mock.Adapter');
            
        });
        

        
    });
    
    
    // ### Mocking Show
    it('should support mocking show', function() {
                
        var controller = $controller("ItemController", {$scope: scope});
        Item.expect('show');
        controller.show();
        Item.flush();
        expect(scope.item).not.toBeUndefined();
        
    });
    
});