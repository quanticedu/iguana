'use strict';

describe('Iguana.Crud', function() {

    var Item;

    beforeEach(function() {
        module('Iguana');
        inject(function($injector, _Iguana_) {
            var Iguana = _Iguana_;
            Item = Iguana.subclass(function() {
                this.setCollection('items');
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
            assertMakesApiCallAndReturnsASingleInstance('update', [{
                id: 'id'
            }]);
        });

        it('should make an api call and handle an error', function() {
            assertMakesApiCallAndFiresErrorCallback('update', [{
                id: 'id'
            }]);
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
            var item = Item.new({
                id: 'id'
            });
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
            spyOn(Item.adapter(), 'create').and.returnValue(mockPromise);
            var metadata = {
                meta: 'data'
            };
            item.save(metadata);
            expect(Item.adapter().create).toHaveBeenCalled();
            expect(Item.adapter().create.calls.argsFor(0)[2]).toBe(metadata);
        });

        it('should fire error when creating a new item', function() {
            var item = Item.new({});
            assertFiresErrorCallbackOnSave(item, 'create');
        });

        it('should fire error when updating an existing item', function() {
            var item = Item.new({
                id: 'id'
            });
            assertFiresErrorCallbackOnSave(item, 'update');
        });

        it('should set the saving flag while saving', function() {
            var item = Item.new({
                id: 'id'
            });
            Item.adapter().expect('update');
            item.save();
            expect(item.$$saving).toBe(true);
            var callback = jasmine.createSpy('callback');
            item.$$savePromise.then(callback);
            Item.adapter().flush('update');
            expect(item.$$saving).toBe(false);
            expect(callback).toHaveBeenCalled();
        });

        it('should unset the saving flag on error', function() {
            var item = Item.new({
                id: 'id'
            });
            Item.adapter().expect('update', 'items', [item.asJson()], {
                error: 'error'
            });
            item.save();
            expect(item.$$saving).toBe(true);
            Item.adapter().flush('update');
            expect(item.$$saving).toBe(false);
        });

        /*
            This block tests the behavior of $$saving and $$savePromise when
            multiple save calls go out before the first one returns
        */
        describe('$$saving and $$savePromise with consecutive save calls', function() {

            afterEach(function() {
                // do it again to make sure it works more than once in a row
                makeConsecutiveSaveCallsAndWatchSavePromise('success', 'success');
            });

            it('should handle consecutive successes', function() {
                makeConsecutiveSaveCallsAndWatchSavePromise('success', 'success');

            });

            it('should handle consecutive errors', function() {
                makeConsecutiveSaveCallsAndWatchSavePromise('errors', 'errors');
            });

            it('should handle a mix of errors and successes with error at the end', function() {
                makeConsecutiveSaveCallsAndWatchSavePromise('success', 'error', 'success', 'success', 'error');
            });

            it('should handle a mix of errors and successes with success at the end', function() {
                makeConsecutiveSaveCallsAndWatchSavePromise('success', 'error', 'success', 'success', 'error', 'success');
            });

            function makeConsecutiveSaveCallsAndWatchSavePromise() {
                var results = Array.prototype.slice.call(arguments);
                var item = Item.new({
                    id: 1
                });
                var i;

                // setup the expectations
                var expectedErrors = [];
                results.forEach(function(result) {
                    if (result === 'error') {
                        Item.adapter().expect('update', 'items', [item.asJson()], {
                            error: 'error'
                        });
                        expectedErrors.push('error');
                    } else {
                        Item.adapter().expect('update');
                    }
                });

                // make all the save calls
                for (i = 0; i < results.length; i++) {
                    item.save();
                }

                // now saving should be true. set up callbacks
                // on $$savePromise
                expect(item.$$saving).toBe(true);
                var success = jasmine.createSpy('success');
                var failure = jasmine.createSpy('failure');
                item.$$savePromise.then(success, failure);

                // flush all but one call
                for (i = 0; i < results.length - 1; i++) {
                    Item.adapter().flush('update');
                }

                // saving should still be true and no callback should have been called
                expect(item.$$saving).toBe(true);
                expect(success).not.toHaveBeenCalled();
                expect(failure).not.toHaveBeenCalled();

                // flush the last save call
                Item.adapter().flush('update');

                // saving should be false and appropriate handler should have been called
                expect(item.$$saving).toBe(false);
                if (expectedErrors.length > 0) {
                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalled();
                    expect(failure.calls.argsFor(0)[0].errors).toEqual(expectedErrors);
                } else {
                    expect(success).toHaveBeenCalled();
                    expect(failure).not.toHaveBeenCalled();
                }
            }

        });

        function assertSavesAndFiresSuccessCallback(item, action) {
            var toBeSpiedOn = {
                onSuccess: function(response) {
                    expect(response.result).toBe(item);
                    expect(response.meta).toBe('meta');
                }
            };
            spyOn(toBeSpiedOn, 'onSuccess').and.callThrough();

            Item.adapter().expect(action, 'items', [item.asJson()], {
                result: [item.asJson()],
                meta: 'meta'
            });

            item.save().then(toBeSpiedOn.onSuccess);
            expect(toBeSpiedOn.onSuccess).not.toHaveBeenCalled(); // results have not come back from the server yet
            Item.adapter().flush(action);
            expect(toBeSpiedOn.onSuccess).toHaveBeenCalled();
        }

        function assertFiresErrorCallbackOnSave(item, action) {
            var error = {
                message: 'message'
            };
            var toBeSpiedOn = {
                onError: null
            };
            spyOn(toBeSpiedOn, 'onError');

            Item.adapter().expect(action, 'items', [item.asJson()], {
                error: error
            });

            item.save().catch(toBeSpiedOn.onError);
            expect(toBeSpiedOn.onError).not.toHaveBeenCalled(); // results have not come back from the server yet
            Item.adapter().flush(action);
            expect(toBeSpiedOn.onError).toHaveBeenCalled();
        }
    });

    describe('InstanceMethod destroy', function() {
        it('should destroy an instance and call success', function() {
            var toBeSpiedOn = {
                onSuccess: function(response) {
                    expect(response.result).toBe(null);
                    expect(response.meta).toBe('meta');
                }
            };
            spyOn(toBeSpiedOn, 'onSuccess').and.callThrough();

            var item = Item.new({
                id: 'id'
            });
            Item.adapter().expect('destroy', 'items', ['id'], {
                result: [],
                meta: 'meta'
            });
            item.destroy().then(toBeSpiedOn.onSuccess);

            expect(toBeSpiedOn.onSuccess).not.toHaveBeenCalled(); // results have not come back from the server yet
            Item.adapter().flush('destroy');
            expect(toBeSpiedOn.onSuccess).toHaveBeenCalled();
        });

        it('should fire an error when failing to destroy', function() {
            var error = {
                message: 'message'
            };
            var toBeSpiedOn = {
                onError: null
            };
            spyOn(toBeSpiedOn, 'onError');

            var item = Item.new({
                id: 'id'
            });
            Item.adapter().expect('destroy', 'items', ['id'], {
                error: 'error'
            });
            item.destroy().catch(toBeSpiedOn.onError);

            expect(toBeSpiedOn.onError).not.toHaveBeenCalled(); // results have not come back from the server yet
            Item.adapter().flush('destroy');
            expect(toBeSpiedOn.onError).toHaveBeenCalledWith('error');
        });

        it('should set the destroying and saving flags while saving', function() {
            var item = Item.new({
                id: 'id'
            });
            Item.adapter().expect('destroy');
            item.destroy();
            expect(item.$$destroying).toBe(true);
            var callback = jasmine.createSpy('callback');
            expect(item.$$saving).toBe(true);
            item.$$savePromise.then(callback);
            Item.adapter().flush('destroy');
            expect(item.$$destroying).toBe(false);
            expect(item.$$saving).toBe(false);
            expect(callback).toHaveBeenCalled();
        });

        it('should unset the destroying and saving flags on error', function() {
            var item = Item.new({
                id: 'id'
            });
            Item.adapter().expect('destroy', 'items', ['id'], {
                error: 'error'
            });
            item.destroy();
            expect(item.$$destroying).toBe(true);
            expect(item.$$saving).toBe(true);
            Item.adapter().flush('destroy');
            expect(item.$$destroying).toBe(false);
            expect(item.$$saving).toBe(false);
        });
    });

    function assertMakesApiCallAndReturnsNothing(meth, args) {
        assertMakesApiCallAndFiresSuccessCallback(meth, args, [], function(response) {
            expect(response.result).toBe(null);
            expect(response.meta).toBe('meta');
        });
    }

    function assertMakesApiCallAndReturnsASingleInstance(meth, args) {
        var attrs = {
            id: 'id'
        };
        assertMakesApiCallAndFiresSuccessCallback(meth, args, [attrs], function(response) {
            var item = response.result;
            expect(item.asJson()).toEqual(attrs);
            expect(item.constructor).toBe(Item);
            expect(response.meta).toBe('meta');
        });
    }

    function assertMakesApiCallAndReturnsAnArrayOfInstances(meth, args) {
        var attrs = [{
            id: 'id1'
        }, {
            id: 'id2'
        }];
        assertMakesApiCallAndFiresSuccessCallback('index', args, attrs, function(response) {
            var items = response.result;
            var json = [];
            angular.forEach(items, function(item) {
                expect(item.constructor).toBe(Item);
                json.push(item.asJson());
            });
            expect(json).toEqual(attrs);
            expect(response.meta).toBe('meta');
        });
    }

    function assertMakesApiCallAndFiresSuccessCallback(meth, args, returnAttrs, success) {
        var toBeSpiedOn = {
            onSuccess: success
        };
        spyOn(toBeSpiedOn, 'onSuccess').and.callThrough();

        Item.adapter().expect(meth, 'items', args, {
            result: returnAttrs,
            meta: 'meta'
        });

        Item[meth].apply(Item, args).then(toBeSpiedOn.onSuccess);
        expect(toBeSpiedOn.onSuccess).not.toHaveBeenCalled(); // results have not come back from the server yet
        Item.adapter().flush(meth);
        expect(toBeSpiedOn.onSuccess).toHaveBeenCalled();
    }

    function assertMakesApiCallAndFiresErrorCallback(meth, args) {
        var error = {
            message: 'message'
        };
        var toBeSpiedOn = {
            onError: null
        };
        spyOn(toBeSpiedOn, 'onError');

        Item.adapter().expect(meth, 'items', args, {
            error: error
        });

        Item[meth].apply(Item, args).catch(toBeSpiedOn.onError);
        expect(toBeSpiedOn.onError).not.toHaveBeenCalled(); // results have not come back from the server yet
        Item.adapter().flush(meth);
        expect(toBeSpiedOn.onError).toHaveBeenCalledWith(error);
    }



});