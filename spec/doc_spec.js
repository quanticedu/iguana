'use strict';

describe('Iguana', function() {
    
    var myApp;
    
    beforeEach(function() {
        
        // # Basics
        
        // ### Include Iguana in your app and configure it. 
        // Set the adapter and baseUrl in your app's config method.
        myApp = angular.module('myApp', ['Iguana'])
            .config(function(IguanaProvider) {
                
                //Adapters allow Iguana to work with any crud api by translating
                //between the api's expected format and Iguana's expected format.  Iguana
                //currently ships with one built-in adapter, Iguana.Adapters.RestfulIdStyle,
                //and one mock adapter for use in tests.  We're using the mock adapter here.
                IguanaProvider.setAdapter('Iguana.Mock.Adapter');
                
                //Set the baseUrl for your api.  By default this id '', 
                //so if you don't override it then it will 
                //hit your site's domain.
                IguanaProvider.setBaseUrl('http:://baseurl');
                
        });
        
    });
    
    
    it('should show an item', function() {
        
        // ### Create an Iguana class
        // Create one Iguana class for each type of data you want to load up from your api.
        // Iguana classes are based on [a-class-above](https://github.com/pedago/a-class-above)'s OOP structure.
        // Here, this.setCollection is calling a class method on our new Item class.
        //  
        // The collection name is used for building urls when hitting the
        // api. In this case, the urls for this class will be
        // http:://baseurl/items.json or http:://baseurl/items/SOME_ID.json
        myApp.factory('Item', function(Iguana){
            
            return Iguana.subclass(function() {
                
                this.setCollection("items");
            });
            
        });  
    
        // ### Fetch something from your api
        // Create a controller that will load up a model from the api and use it
        // for something
        //Create controller
        myApp.controller('ShowItemController', function(Item, $scope, $window){
            
            // Call 'show' to load up a single item from the database,
            // and then stick it onto the scope once it is loaded.
            //Call Item.show
            Item.show($scope.itemId).then(function(response){
                $scope.item = response.result;
            }, function(error) {
                $window.alert('Something went wrong: '+error.message);
            });
        });
        
        module('myApp');        
        inject(function($rootScope, $controller, Item){
            var scope = $rootScope.$new();
            scope.itemId = "id";
            
            Item.adapter().expect('show', 'items', 'id', {
                result: [{id: 'id', prop: 'value'}],
                meta: {}
            });
            $controller("ShowItemController", {$scope: scope});
            Item.adapter().flush('show');
            
            var loadedItem = scope.item;
            expect(loadedItem.constructor).toBe(Item);
            expect(loadedItem.prop).toBe('value');
            
        });
        
    });
    
    it('should add instance methods onto our model', function() {
        
        // ### Add instance methods to your class
        // [a-class-above](https://github.com/pedago/a-class-above) allows
        // us to add instance methods to our class.
        myApp.factory('Item', function(Iguana){
            
            return Iguana.subclass(function() {
                                
                this.setCollection("items");
                
                //We return an instance mixin that will be mixed in
                //to our class.
                return {
                    awesomeness: function() {
                        return this.size * this.quality;
                    }
                }
            });
            
        }); 
        
        myApp.controller('ShowItemController', function(Item, $scope, $window){
            
            // Call 'show' to load up a single item from the database,
            // and then call an instance method on it to build an alert message.
            //Call Item.show
            Item.show($scope.itemId).then(function(response){
                var item = response.result;
                $window.alert('You loaded an item with an awesomeness level of '+item.awesomeness());
            });
        });
        
        //This is the object that will come back from the api.  So we
        //should expect to see an awesomeness level of 3 * 4 = 12
        var attrs = {id: 'id', size: 3, quality: 4};
        
        module('myApp');        
        inject(function($rootScope, $controller, Item, $window){
            var scope = $rootScope.$new();
            scope.itemId = "id";
            spyOn($window, 'alert');
            
            Item.adapter().expect('show', 'items', 'id', {
                result: [attrs],
                meta: {}
            });
            $controller("ShowItemController", {$scope: scope});
            Item.adapter().flush('show');
            
            expect($window.alert).toHaveBeenCalledWith('You loaded an item with an awesomeness level of 12');
            
        });
        
    });
    
    it('should show many items', function() {

        myApp.factory('Item', function(Iguana){
            
            return Iguana.subclass(function() {
                
                this.setCollection("items");
            });
            
        });  
    
        // ### Fetch many things from your api
        // Create a controller that will load up models from the api
        //Create controller
        myApp.controller('ListItemsController', function(Item, $scope, $window){
            
            // Call 'index' to load up a list of items from the database.  Right now,
            // Iguana does not support any sort of querying functionality in index.  It can
            // only return everything for a collection.  We will have to fix this very soon.
            //Call Item.index
            Item.index().then(function(response){
                $scope.items = response.result;
            }, function(error) {
                $window.alert('Something went wrong: '+error.message);
            });
        });
        
        module('myApp');        
        inject(function($rootScope, $controller, Item){
            var scope = $rootScope.$new();
            
            Item.adapter().expect('index', 'items', [], {
                result: [{id: 'id1'}, {id: 'id2'}],
                meta: {}
            });
            $controller("ListItemsController", {$scope: scope});
            Item.adapter().flush('index');
            
            var loadedItems = scope.items;
            expect(loadedItems.length).toBe(2);
            expect(loadedItems[0].constructor).toBe(Item);
            
        });
        
    });
    
    it('should let us save things, too', function() {
        
        myApp.factory('Item', function(Iguana){
            
            return Iguana.subclass(function() {
                
                this.setCollection("items");
            });
            
        });  
    
        // ### Save something
        myApp.controller('EditItemController', function(Item, $scope, $window){
            
            // If an itemId is passed into our controller, then it will
            // load up the item so we can update it (Imagine there is a form
            // on the screen with form elements found to properties on our item.)
            if ($scope.itemId) {
                Item.show($scope.itemId).then(function(response){
                    $scope.item = response.result;
                }, function(error) {
                    $window.alert('Something went wrong: '+error.message);
                });
            } else {
                // If no itemId is passed in then we will create a new one
                $scope.item = new Item();
            }
            
            // Respond to some user action by calling item.save() and then 
            // responding to success and failure conditions.
            $scope.save = function() {
                if ($scope.item) {
                    $scope.item.save().then(function() {
                        $window.alert("Saved!");
                    }, function() {
                        $window.alert('Something went wrong: '+error.message);
                    });
                }
            }
        }); 
        
        module('myApp');        
        inject(function($rootScope, $controller, Item, $window){
            //Creating a new item
            var scope = $rootScope.$new();
            spyOn($window, 'alert');
            $controller("EditItemController", {$scope: scope});
            scope.item.prop = "set";
            
            //Since the item does not have an id, we will call the "create"
            //method on our api.
            Item.adapter().expect('create', 'items', scope.item.asJson(), {
                result: [scope.item.asJson()],
                meta: {}
            });
            scope.save();
            Item.adapter().flush('create')
            expect($window.alert).toHaveBeenCalledWith('Saved!');
            
            //Updating an existing item
            scope = $rootScope.$new();
            scope.itemId = "id";
            Item.adapter().expect('show', 'items', 'id', {
                result: [{id: 'id', prop: 'value'}],
                meta: {}
            });
            $controller("EditItemController", {$scope: scope});
            Item.adapter().flush('show');
            expect(scope.item.prop).toBe('value');
            scope.item.prop = "reset";   
            //Since the item already has an id, we will call the "update"
            //method on our api.
            Item.adapter().expect('update', 'items', scope.item.asJson(), {
                result: [scope.item.asJson()],
                meta: {}
            });         
            scope.save();
            expect($window.alert.calls.length).toBe(1);
            Item.adapter().flush('update');
            expect($window.alert.calls.length).toBe(2);
            
        });      
    });
    
    it('should event let us delete things', function() {
        
        myApp.factory('Item', function(Iguana){
            
            return Iguana.subclass(function() {
                
                this.setCollection("items");
            });
            
        });  
    
        // ### Delete something
        myApp.controller('EditItemController', function(Item, $scope, $window){
            
            // If an itemId is passed into our controller, then it will
            // load up the item so we can update it (Imagine there is a form
            // on the screen with form elements found to properties on our item.)
            if ($scope.itemId) {
                Item.show($scope.itemId).then(function(response){
                    $scope.item = response.result;
                }, function(error) {
                    $window.alert('Something went wrong: '+error.message);
                });
            } else {
                // If no itemId is passed in then we will create a new one
                $scope.item = new Item();
            }
            
            // Respond to some user action by calling item.destroy() and then 
            // responding to success and failure conditions.
            $scope.destroy = function() {
                if ($scope.item) {
                    $scope.item.destroy().then(function() {
                        $window.alert("Destroyed!");
                    }, function() {
                        $window.alert('Something went wrong: '+error.message);
                    });
                }
            }
        }); 
        
        module('myApp');        
        inject(function($rootScope, $controller, Item, $window){
            
            //Deleting an existing item
            var scope = $rootScope.$new();
            spyOn($window, 'alert');
            scope.itemId = "id";
            Item.adapter().expect('show', 'items', 'id', {
                result: [{id: 'id', prop: 'value'}],
                meta: {}
            });
            $controller("EditItemController", {$scope: scope});
            Item.adapter().flush('show');
            
            Item.adapter().expect('destroy', 'items', scope.item.id, {
                result: [],
                meta: {}
            });         
            scope.destroy();
            Item.adapter().flush('destroy');
            expect($window.alert).toHaveBeenCalledWith('Destroyed!')
            
        });      
    });
    
});