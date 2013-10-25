angular.module('Iguana')
.factory('Iguana.Mock.Adapter', ['Iguana.Adapters.AdapterBase', '$q', '$rootScope', function(AdapterBase, $q, $rootScope){
        
        return AdapterBase.subclass(function() {
            
            return {
                show: function(collection, arg1, arg2) {
                    return this._makeApiCall(collection, 'show');                    
                },
                
                index: function(collection, arg1, arg2) {
                    return this._makeApiCall(collection, 'index');
                },
                
                create: function(collection, arg1, arg2) {
                    return this._makeApiCall(collection, 'create');
                },
                
                update: function(collection, arg1, arg2) {
                    return this._makeApiCall(collection, 'update');
                },
                
                destroy: function(collection, arg1, arg2) {
                    return this._makeApiCall(collection, 'destroy');
                },
                
                expect: function(meth, collection, expectedArgs, response) {
                    var error = response.error;
                    expectedArgs = [collection].concat(expectedArgs);
                    delete response.error;
                    spyOn(this, meth).andCallThrough();
                    if (response.result && Object.prototype.toString.call( response.result ) !== '[object Array]') {
                        throw new Error("response.result should be an array, as adapters always return an array of results");
                    }
                    this._pendingResponses()[meth].push({
                        response: response,
                        expectedArgs: expectedArgs,
                        error: error
                    });
                },
                
                flush: function(meth) {
                    if (!meth) {
                        throw new Error("You must pass a meth (i.e. show, index, ...) to flush()");
                    }
                    var deferred = this._pendingQs()[meth] && this._pendingQs()[meth].shift();
                    if (!deferred) {
                        throw new Error('No '+meth+' requests pending.');
                    }
                    if (deferred) {
                        var _pendingResponses = this._pendingResponses()[meth].shift();
                        if (!_pendingResponses) {
                            throw new Error('No result pending for '+meth+'.  You need to call expect("'+meth+', EXPECTED_RESULT")');
                        }                        
                        var expectation = expect(this[meth]);
                        expectation.toHaveBeenCalledWith.apply(expectation, _pendingResponses.expectedArgs);
                        if (_pendingResponses.error) {
                            deferred.reject(_pendingResponses.error);
                        } else {
                            deferred.resolve(_pendingResponses.response);
                        }                        
                        $rootScope.$apply();
                    }
                },
                
                _pendingQs: function() {
                    if (!this.__pendingQs) { 
                        this.__pendingQs = this._initialPendingHash();
                    }
                    return this.__pendingQs;
                },
                
                _pendingResponses: function() {
                    if (!this.__pendingResponses) { 
                        this.__pendingResponses = this._initialPendingHash();
                    }
                    return this.__pendingResponses;
                },
                
                _makeApiCall: function(collection, meth) {
                    var deferred = $q.defer();
                    if (!this._pendingResponses()[meth][0]) {
                        throw new Error('Unexpected call to '+meth+'.  You need to call expect()');
                    };                 
                    this._pendingQs()[meth].push(deferred);
                    return deferred.promise;
                },
                
                _initialPendingHash: function() {
                    return {
                        show: [],
                        index: [],
                        create: [],
                        update: [],
                        destroy: []
                    };
                }
            };
            
        });
        
    }]);