'use strict';

describe('Iguana.Adapters.RestfulIdStyle', function() {

    var Item, $httpBackend;

    beforeEach(function() {
        module('Iguana', 'Iguana.Adapters.RestfulIdStyle');
        inject(function($injector, _Iguana_) {
            $httpBackend = $injector.get('$httpBackend');
            var Iguana = _Iguana_;
            Item = Iguana.subclass(function() {
                this.setCollection("items");
            });
            Iguana.setAdapter('Iguana.Adapters.RestfulIdStyle');
        });
    });
    
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
    
    describe('show', function() {
        
        it('should make an api call and process the result', function() {
            var attrs = {id: 'id'};
            $httpBackend.expectGET('/items/id.json').respond(200, {contents: {items: [attrs]}, meta: 'meta'});
            spyOn(Item, '_instantiateFromResponse');
            Item.show('id');
            $httpBackend.flush();
            expect(Item._instantiateFromResponse.calls.length).toBe(1);
            var response = Item._instantiateFromResponse.calls[0].args[1];
            expect(response.result).toEqual([attrs]);
            expect(response.meta).toEqual('meta');
        });
        
    });
    
    describe('index', function() {
        
        it('should make an api call and process the result', function() {
            var attrs = [{id: 'id1'}, {id: 'id2'}];
            $httpBackend.expectGET('/items.json').respond(200, {contents: {items: attrs}, meta: 'meta'});
            spyOn(Item, '_instantiateFromResponse');
            Item.index();
            $httpBackend.flush();
            expect(Item._instantiateFromResponse.calls.length).toBe(1);
            var response = Item._instantiateFromResponse.calls[0].args[1];
            expect(response.result).toEqual(attrs);
            expect(response.meta).toEqual('meta');
        });
        
    });
    
    describe('create', function() {
        
        it('should make an api call and process the result', function() {
            var attrs = {id: 'id'};
            $httpBackend.expectPOST('/items.json', {record: {}}).respond(200, {contents: {items: [attrs]}, meta: 'meta'});
            spyOn(Item, '_instantiateFromResponse');
            Item.create({});
            $httpBackend.flush();
            expect(Item._instantiateFromResponse.calls.length).toBe(1);
            var response = Item._instantiateFromResponse.calls[0].args[1];
            expect(response.result).toEqual([attrs]);
            expect(response.meta).toEqual('meta');
        });
        
    });
    
    describe('update', function() {
        
        it('should make an api call and process the result', function() {
            var attrs = {id: 'id'};
            $httpBackend.expectPUT('/items.json', {record: attrs}).respond(200, {contents: {items: [attrs]}, meta: 'meta'});
            spyOn(Item, '_instantiateFromResponse');
            Item.update(attrs);
            $httpBackend.flush();
            expect(Item._instantiateFromResponse.calls.length).toBe(1);
            var response = Item._instantiateFromResponse.calls[0].args[1];
            expect(response.result).toEqual([attrs]);
            expect(response.meta).toEqual('meta');
        });
        
    });
    
    describe('destroy', function() {
        
        it('should make an api call and process the result', function() {
            var attrs = {id: 'id'};
            $httpBackend.expectDELETE('/items/id.json').respond(200, {contents: {}, meta: 'meta'});
            spyOn(Item, '_prepareEmptyResponse');
            Item.destroy('id');
            $httpBackend.flush();
            expect(Item._prepareEmptyResponse.calls.length).toBe(1);
            var response = Item._prepareEmptyResponse.calls[0].args[0];
            expect(response.result).toEqual([]);
            expect(response.meta).toEqual('meta');
        });
        
    });

    
});
