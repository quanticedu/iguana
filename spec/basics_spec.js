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
        myApp.factory('Item', function(Iguana) {

            return Iguana.subclass(function() {

                this.setCollection("items");
            });

        });

        // ### Fetch something from your api
        // Create a controller that will load up a model from the api and use it
        // for something
        //Create controller
        myApp.controller('ShowItemController', function(Item, $scope, $window) {

            // Here we are calling 'show' to load up a single item from the database,
            // and then stick it onto the scope once it is loaded.  
            //  
            // ### <a id='querying'></a>Querying
            // This example shows us passing an id to 'show', but what if you needed
            // to run a more complex query?  The supported querying functionality for 'show' and
            // 'index' is defined by the adapter that you are using.  Check the documentation
            // for your adapter for information on how to query.
            //
            //Call Item.show
            Item.show($scope.itemId).then(function(response) {
                $scope.item = response.result;
            }, function(error) {
                $window.alert('Something went wrong: ' + error.message);
            });
        });

        module('myApp');
        inject(function(MockIguana, $rootScope, $controller, Item) {
            var scope = $rootScope.$new();
            scope.itemId = "id";

            Item.expect('show').toBeCalledWith('id').returns({
                id: 'id',
                someString: 'value',
                someNumber: 1.4,
                someArray: [1, 2, 3, 4],
                someObject: {
                    a: 1
                }
            });
            $controller("ShowItemController", {
                $scope: scope
            });
            Item.flush('show');

            var loadedItem = scope.item;

            // The value of response.result is an instance of Item,
            // and all of the properties that came over the api
            // have been copied onto it.
            expect(loadedItem.constructor).toBe(Item);
            expect(loadedItem.id).toBe('id');
            expect(loadedItem.someString).toEqual('value');
            expect(loadedItem.someNumber).toEqual(1.4);
            expect(loadedItem.someArray).toEqual([1, 2, 3, 4]);
            expect(loadedItem.someObject).toEqual({
                a: 1
            });

        });

    });

    // ### setting the id property
    // By default, Iguana assumes that your documents have a property called 'id'
    // which includes a unique id for your document.  You can change the name of 
    // the property that is used as the unique identifier with the *setIdProperty* class method.
    it('should allow the idProperty to be overridden', function() {

        module('myApp');
        inject(function(Iguana) {
            var Item = Iguana.subclass(function() {
                this.setIdProperty('customIdProp');
            });

            Item.new({
                customIdProp: 'id'
            });
        });



    });

    it('should add instance methods onto our model', function() {

        // ### Add instance methods to your class
        // [a-class-above](https://github.com/pedago/a-class-above) allows
        // us to add instance methods to our class.
        myApp.factory('Item', function(Iguana) {

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

        myApp.controller('ShowItemController', function(Item, $scope, $window) {

            //Call Item.show
            Item.show($scope.itemId).then(function(response) {
                var item = response.result;
                $window.alert('You loaded an item with an awesomeness level of ' + item.awesomeness());
            });
        });

        //This is the object that will come back from the api.  So we
        //should expect to see an awesomeness level of 3 * 4 = 12
        var attrs = {
            id: 'id',
            size: 3,
            quality: 4
        };

        module('myApp');
        inject(function($rootScope, $controller, Item, $window, MockIguana) {
            var scope = $rootScope.$new();
            scope.itemId = "id";
            spyOn($window, 'alert');

            Item.expect('show').returns(attrs);
            $controller("ShowItemController", {
                $scope: scope
            });
            Item.flush('show');

            expect($window.alert).toHaveBeenCalledWith('You loaded an item with an awesomeness level of 12');

        });

    });

    it('should show many items', function() {

        myApp.factory('Item', function(Iguana) {

            return Iguana.subclass(function() {

                this.setCollection("items");
            });

        });

        // ### Fetch many things from your api
        // Create a controller that will load up models from the api
        //Create controller
        myApp.controller('ListItemsController', function(Item, $scope, $window) {

            // Call 'index' to load up a list of items from the database.  As with show,
            // supported querying functionality is defined by the adapter ([see note above](#querying))
            //Call Item.index
            Item.index().then(function(response) {
                $scope.items = response.result;
            }, function(error) {
                $window.alert('Something went wrong: ' + error.message);
            });
        });

        module('myApp');
        inject(function(MockIguana, $rootScope, $controller, Item) {
            var scope = $rootScope.$new();

            Item.expect('index').returns([{
                id: 'id1'
            }, {
                id: 'id2'
            }]);
            $controller("ListItemsController", {
                $scope: scope
            });
            Item.flush('index');

            var loadedItems = scope.items;
            expect(loadedItems.length).toBe(2);
            expect(loadedItems[0].constructor).toBe(Item);

        });

    });

    it('should let us save things, too', function() {

        myApp.factory('Item', function(Iguana) {

            return Iguana.subclass(function() {

                this.setCollection("items");
            });

        });

        // ### Save something
        myApp.controller('EditItemController', function(Item, $scope, $window) {

            // If an itemId is passed into our controller, then it will
            // load up the item so we can update it (Imagine there is a form
            // on the screen with form elements found to properties on our item.)
            if ($scope.itemId) {
                Item.show($scope.itemId).then(function(response) {
                    $scope.item = response.result;
                }, function(error) {
                    $window.alert('Something went wrong: ' + error.message);
                });
            } else {
                // If no itemId is passed in then we will create a new one
                $scope.item = Item.new();
            }

            // Respond to some user action by calling item.save() and then 
            // responding to success and failure conditions.
            $scope.save = function() {
                if ($scope.item) {
                    $scope.item.save().then(function() {
                        $window.alert("Saved!");
                    }, function(error) {
                        $window.alert('Something went wrong: ' + error.message);
                    });
                }
            }
        });

        module('myApp');
        inject(function(MockIguana, $rootScope, $controller, Item, $window) {
            //Creating a new item
            var scope = $rootScope.$new();
            spyOn($window, 'alert');
            $controller("EditItemController", {
                $scope: scope
            });

            // The object that gets sent to the api will be the
            // jsonified version of our instance (following the rules of
            // angular.toJson).  This means that any property whose name does
            // not start with '$' and whose value is not a function will be sent
            // to the api's 'save' method.
            scope.item.some = "value";
            scope.item.someNumber = 1.4;
            scope.item.someArray = [1, 2, 3, 4];
            scope.item.someObject = {
                a: 1
            };
            scope.item.ignoreThisFunction = function() {};
            scope.item.$$ignoreThisProperty = "ignored";

            //Since the item does not have an id, we will call the "create"
            //method on our api.
            Item.expect('create').toBeCalledWith(scope.item);
            scope.save();
            Item.flush('create')
            expect($window.alert).toHaveBeenCalledWith('Saved!');

            //Updating an existing item
            scope = $rootScope.$new();
            scope.itemId = "id";
            Item.expect('show').returns({
                id: 'id',
                prop: 'value'
            });
            $controller("EditItemController", {
                $scope: scope
            });
            Item.flush('show');
            expect(scope.item.prop).toBe('value');
            scope.item.prop = "reset";
            //Since the item already has an id, we will call the "update"
            //method on our api.
            Item.expect('update').toBeCalledWith(scope.item.asJson());
            scope.save();
            expect($window.alert.calls.count()).toBe(1);
            Item.flush('update');
            expect($window.alert.calls.count()).toBe(2);

        });
    });

    it('should let us delete things', function() {

        myApp.factory('Item', function(Iguana) {

            return Iguana.subclass(function() {

                this.setCollection("items");
            });

        });

        // ### Delete something
        myApp.controller('EditItemController', function(Item, $scope, $window) {

            // If an itemId is passed into our controller, then it will
            // load up the item so we can update it (Imagine there is a form
            // on the screen with form elements found to properties on our item.)
            if ($scope.itemId) {
                Item.show($scope.itemId).then(function(response) {
                    $scope.item = response.result;
                }, function(error) {
                    $window.alert('Something went wrong: ' + error.message);
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
                    }, function(error) {
                        $window.alert('Something went wrong: ' + error.message);
                    });
                }
            }
        });

        module('myApp');
        inject(function(MockIguana, $rootScope, $controller, Item, $window) {

            //Deleting an existing item
            var scope = $rootScope.$new();
            spyOn($window, 'alert');
            scope.itemId = "id";
            Item.expect('show').returns({
                id: 'id',
                prop: 'value'
            });
            $controller("EditItemController", {
                $scope: scope
            });
            Item.flush('show');

            Item.expect('destroy').toBeCalledWith(scope.item.id);
            scope.destroy();
            Item.flush('destroy');
            expect($window.alert).toHaveBeenCalledWith('Destroyed!')

        });
    });

});