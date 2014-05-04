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
            .config(function(IguanaProvider){
                IguanaProvider.setAdapter('Iguana.Adapters.RestfulIdStyle');
            });
        
        module('myApp');
        
        inject(function($injector, _Iguana_) {
            $httpBackend = $injector.get('$httpBackend');
            var Iguana = _Iguana_;
            Item = Iguana.subclass(function() {
                this.setCollection("items");
            });
        });
    });
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    
    
    
    describe('show', function() {
        
        // ### show
        // Show accepts a single argument, which is the id of a document.  
        //   
        // The second argument can be any object, and will be passed through to the server-side api
        it('should make an api call and process the result', function() {
            var attrs = {id: 'id'};
            $httpBackend.expectGET('/items/id.json?queryParam=1').respond(200, {contents: {items: [attrs]}, meta: 'meta'});
            spyOn(Item, '_instantiateFromResponse');
            
            //Calling show with an id 
            Item.show('id', {queryParam: 1});
            $httpBackend.flush();
            expect(Item._instantiateFromResponse.calls.length).toBe(1);
            var response = Item._instantiateFromResponse.calls[0].args[1];
            
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
            var attrsList = [{id: 'id1'}, {id: 'id2'}];
            $httpBackend.expectGET('/items.json?queryParam=1').respond(200, {contents: {items: attrsList}, meta: 'meta'});
            spyOn(Item, '_instantiateFromResponse');
            Item.index({queryParam: 1});
            $httpBackend.flush();
            expect(Item._instantiateFromResponse.calls.length).toBe(1);
            var response = Item._instantiateFromResponse.calls[0].args[1];
            
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
            var attrs = {prop: 'value'};
            var metadata = {meta: 'data'};
            var returnAttrs = angular.extend({}, attrs, {id: 'id'});
            $httpBackend.expectPOST('/items.json', {record: attrs, meta: metadata}).respond(200, {contents: {items: [returnAttrs]}, meta: 'meta'});
            var callbacks = {success: function(response){
                expect(response.result.constructor).toBe(Item);
                expect(response.result.asJson()).toEqual(returnAttrs);
                expect(response.meta).toBe('meta');
            }};
            spyOn(callbacks, 'success').andCallThrough();
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
            var attrs = {id: 'id', prop: 'value'};
            var metadata = {meta: 'data'};
            $httpBackend.expectPUT('/items.json', {record: attrs, meta: metadata}).respond(200, {contents: {items: [attrs]}, meta: 'meta'});
            var callbacks = {success: function(response){
                expect(response.result.constructor).toBe(Item);
                expect(response.result.asJson()).toEqual(attrs);
                expect(response.meta).toBe('meta');
            }};
            spyOn(callbacks, 'success').andCallThrough();
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
            var attrs = {id: 'id'};
            $httpBackend.expectDELETE('/items/id.json').respond(200, {contents: {}, meta: 'meta'});
            spyOn(Item, '_prepareEmptyResponse');
            Item.destroy('id');
            $httpBackend.flush();
            expect(Item._prepareEmptyResponse.calls.length).toBe(1);
            var response = Item._prepareEmptyResponse.calls[0].args[0];
            
            //Returning an iguana-formatted response
            expect(response).toEqual({
                result: [],
                meta: 'meta'
            });
        });
        
    });

    
});
