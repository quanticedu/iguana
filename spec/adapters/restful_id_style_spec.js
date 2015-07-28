'use strict';

describe('Iguana.Adapters.RestfulIdStyle', function() {

    var Item, $httpBackend, myApp;

    /**
    # RestfulIdStyle Adapter

    This adapter is based on the [id-style json api](https://gist.github.com/wycats/5500104) described by Yehuda Katz.

    To the api described there, RestfulIdStyle adds the ability to include 
    metadata in responses, as expected by Iguana.  The relationships described in that document
    are not yet supported in RestfulIdStyle, but could be one day.

    */

    // ### Setup
    // Add Iguana and Iguana.Adapters.RestfulIdStyle as dependencies to your app and
    // set it the default adapter for Iguana.
    beforeEach(function() {
        // ...        

        myApp = angular.module('myApp', ['Iguana', 'Iguana.Adapters.RestfulIdStyle'])
            .config(function(IguanaProvider) {
                IguanaProvider.setAdapter('Iguana.Adapters.RestfulIdStyle');
            });

        module('myApp');

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('api methods', function() {
        beforeEach(function() {
            inject(function($injector, _Iguana_) {
                $httpBackend = $injector.get('$httpBackend');
                var Iguana = _Iguana_;
                Item = Iguana.subclass(function() {
                    this.setCollection('items');
                });
            });
        });

        describe('show', function() {

            // ### show
            // Show accepts a single argument, which is the id of a document.  
            //   
            // The second argument can be any object, and will be passed through to the server-side api
            it('should make an api call and process the result', function() {
                var attrs = {
                    id: 'id'
                };
                $httpBackend.expectGET('/items/id.json?queryParam=1').respond(200, {
                    contents: {
                        items: [attrs]
                    },
                    meta: 'meta'
                });
                spyOn(Item, '_instantiateFromResponse');

                //Calling show with an id 
                Item.show('id', {
                    queryParam: 1
                });
                $httpBackend.flush();
                expect(Item._instantiateFromResponse.calls.count()).toBe(1);
                var response = Item._instantiateFromResponse.calls.argsFor(0)[1];

                //Returning an iguana-formatted response
                expect(response).toEqual({
                    result: [attrs],
                    meta: 'meta'
                });
            });

        });

        describe('index', function() {

            // ### index
            // index can accept any query parameters that your server-side api supports.   
            //   
            // As with show (see above), index should eventually support querying functionality.
            it('should make an api call and process the result', function() {
                var attrsList = [{
                    id: 'id1'
                }, {
                    id: 'id2'
                }];
                $httpBackend.expectGET('/items.json?queryParam=1').respond(200, {
                    contents: {
                        items: attrsList
                    },
                    meta: 'meta'
                });
                spyOn(Item, '_instantiateFromResponse');
                Item.index({
                    queryParam: 1
                });
                $httpBackend.flush();
                expect(Item._instantiateFromResponse.calls.count()).toBe(1);
                var response = Item._instantiateFromResponse.calls.argsFor(0)[1];

                //Returning an iguana-formatted response
                expect(response).toEqual({
                    result: attrsList,
                    meta: 'meta'
                });
            });

        });

        describe('create', function() {

            // ### create
            // as required by Iguana.Adapter.Base, create expects a document
            // and an optional metadata hash
            it('should make an api call and process the result', function() {
                var attrs = {
                    prop: 'value'
                };
                var metadata = {
                    meta: 'data'
                };
                var returnAttrs = angular.extend({}, attrs, {
                    id: 'id'
                });
                $httpBackend.expectPOST('/items.json', {
                    record: attrs,
                    meta: metadata
                }).respond(200, {
                    contents: {
                        items: [returnAttrs]
                    },
                    meta: 'meta'
                });
                var callbacks = {
                    success: function(response) {
                        expect(response.result.constructor).toBe(Item);
                        expect(response.result.asJson()).toEqual(returnAttrs);
                        expect(response.meta).toBe('meta');
                    }
                };
                spyOn(callbacks, 'success').and.callThrough();
                Item.create(attrs, metadata).then(callbacks.success);
                $httpBackend.flush();
                expect(callbacks.success).toHaveBeenCalled();
            });

        });

        describe('update', function() {

            // ### update
            // as required by Iguana.Adapter.Base, update expects a document
            // and an optional metadata hash
            it('should make an api call and process the result', function() {
                var attrs = {
                    id: 'id',
                    prop: 'value'
                };
                var metadata = {
                    meta: 'data'
                };
                $httpBackend.expectPUT('/items.json', {
                    record: attrs,
                    meta: metadata
                }).respond(200, {
                    contents: {
                        items: [attrs]
                    },
                    meta: 'meta'
                });
                var callbacks = {
                    success: function(response) {
                        expect(response.result.constructor).toBe(Item);
                        expect(response.result.asJson()).toEqual(attrs);
                        expect(response.meta).toBe('meta');
                    }
                };
                spyOn(callbacks, 'success').and.callThrough();
                Item.update(attrs, metadata).then(callbacks.success);
                $httpBackend.flush();
                expect(callbacks.success).toHaveBeenCalled();
            });

        });

        describe('destroy', function() {

            // ### destroy
            // as required by Iguana.Adapter.Base, destroy expects an id
            // as it's only argument.
            it('should make an api call and process the result', function() {
                var attrs = {
                    id: 'id'
                };
                $httpBackend.expectDELETE('/items/id.json').respond(200, {
                    contents: {},
                    meta: 'meta'
                });
                spyOn(Item, '_prepareEmptyResponse');
                Item.destroy('id');
                $httpBackend.flush();
                expect(Item._prepareEmptyResponse.calls.count()).toBe(1);
                var response = Item._prepareEmptyResponse.calls.argsFor(0)[0];

                //Returning an iguana-formatted response
                expect(response).toEqual({
                    result: [],
                    meta: 'meta'
                });
            });

        });
    });

    describe('options', function() {
        var resourceSpy;

        beforeEach(function() {
            resourceSpy = jasmine.createSpy('$resource');
            resourceSpy.and.returnValue({
                index: function() {},
                show: function() {},
                create: function() {},
                update: function() {},
                destroy: function() {}
            });
            module(function($provide) {
                $provide.value('$resource', resourceSpy);
            });

            inject(function($injector, _Iguana_) {
                var Iguana = _Iguana_;
                $httpBackend = $injector.get('$httpBackend');
                Item = Iguana.subclass(function() {
                    this.setCollection("items");
                });
            });
        });

        // ### options
        // Extra options can be passed in and added onto the request
        it('should pass option down in a show call', function() {
            Item.show('id', {}, {
                option: 42
            });
            expect(resourceSpy).toHaveBeenCalled();
            expect(resourceSpy.calls.argsFor(0)[2].show.option).toBe(42);
        });

        it('should pass option down in an index call', function() {
            Item.index({}, {
                option: 42
            });
            expect(resourceSpy).toHaveBeenCalled();
            expect(resourceSpy.calls.argsFor(0)[2].index.option).toBe(42);
        });

        it('should pass option down in a create call', function() {
            Item.create({}, {}, {
                option: 42
            });
            expect(resourceSpy).toHaveBeenCalled();
            expect(resourceSpy.calls.argsFor(0)[2].create.option).toBe(42);
        });

        it('should pass option down in an update call', function() {
            Item.update({
                id: 1
            }, {}, {
                option: 42
            });
            expect(resourceSpy).toHaveBeenCalled();
            expect(resourceSpy.calls.argsFor(0)[2].update.option).toBe(42);
        });

        it('should pass option down in a destroy call', function() {
            Item.destroy('id', {
                option: 42
            });
            expect(resourceSpy).toHaveBeenCalled();
            expect(resourceSpy.calls.argsFor(0)[2].destroy.option).toBe(42);
        });

        it('should use the default option if none is passed in', function() {
            Item.defaultRequestOptions().set('option', 42);
            Item.show('id', {});
            expect(resourceSpy).toHaveBeenCalled();
            expect(resourceSpy.calls.argsFor(0)[2].show.option).toBe(42);
        });

        it('should override default option if one is passed in', function() {
            Item.defaultRequestOptions().set('option', 42);
            Item.show('id', {}, {
                option: 49
            });
            Item.show('id', {});
            expect(resourceSpy).toHaveBeenCalled();
            expect(resourceSpy.calls.argsFor(0)[2].show.option).toBe(49);
        });

    });


});