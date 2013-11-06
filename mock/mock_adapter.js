angular.module('Iguana')
.factory('Iguana.Mock.Adapter', ['Iguana.Adapters.AdapterBase', '$q', '$rootScope', 'AClassAbove', function(AdapterBase, $q, $rootScope, AClassAbove){
    
        var Expectation = AClassAbove.subclass(function() {
            
            return {
                initialize: function(adapter, meth, result) {
                    this.meth = meth;
                    this.adapter = adapter;
                    this.mockedResult = result;
                    this.mockedMeta = null;
                    this.mockedError = null;
                    try {
                        //We need a try/catch because, if expect is called multiple times,
                        //then spyOn will complain about being called twice on the same
                        //method.
                        spyOn(adapter, meth).andCallThrough();
                    } catch(e) {}
                },
                
                withCollection: function(collection) {
                    this.collection = collection;
                    return this;
                },
                
                toBeCalledWith: function(args) {
                    if (Object.prototype.toString.call( args ) !== '[object Array]') {
                        args = [args];
                    }
                    this.expectedArgs = args;
                    return this;
                },
                
                returns: function(response) {
                    if (!response.result && !response.meta && !response.error) {
                        this.mockedResult = response;
                    }
                    
                    if (response.result) {
                        this.mockedResult = response.result;
                    }
                    
                    if (this.mockedResult && Object.prototype.toString.call( this.mockedResult ) !== '[object Array]') {
                        this.mockedResult = [this.mockedResult];
                    }
                    
                    if (response.meta) {
                        this.returnsMeta(response.meta);
                    }
                    
                    if (response.error) {
                        this.fails(response.error);
                    }
                    
                    return this;
                },
                
                fails: function(err) {
                    this.mockedError = err;
                },
                
                returnsMeta: function(meta) {
                    this.mockedMeta = meta;
                },
                
                mockCalled: function() {
                    this.deferred = $q.defer();
                    return this.deferred.promise;
                },
                
                resolve: function() {
                    var meth = this.adapter[this.meth]
                    if (!meth.calls || meth.calls.length < 1) {
                        throw new Error('Expected '+this.meth+' to have been called, but it was not.');
                    }
                    
                    var call = meth.calls[0];
                    var args = call.args;
                    var collection = args.shift();
                    
                    if (this.collection) {
                        if (collection != this.collection) {
                            throw new Error('Expected '+this.meth+' to have been called on the collection '+this.collection+' but it was called on '+collection+'.');
                        }
                    }
                    
                    if (this.expectedArgs) {
                        expect(args).toEqual(this.expectedArgs);
                    }
                    
                    if (this.mockedError) {
                        this.deferred.reject(this.mockedError);
                    } else {
                        this.deferred.resolve({
                            result: this.mockedResult,
                            meta: this.mockedMeta
                        });
                    }
                    
                }
            };
            
        });    
        
        
        
        
        return AdapterBase.subclass(function() {
            
            return {
                name: 'Iguana.Mock.Adapter',
                
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
                    // we really shouldn't accept collection, expectedArgs or response, but supporting
                    // some old tests
                    
                    var expectation = new Expectation(this, meth);
                    if (collection) {
                        expectation.withCollection(collection);
                    }
                    if (expectedArgs) {
                        
                        expectation.toBeCalledWith(expectedArgs);
                    }
                    if (response) {
                        expectation.returns(response);
                    }
                    
                    this._pendingExpectations()[meth].push(expectation);
                    
                    return expectation;
                },
                
                flush: function(meth) {
                    if (!meth) {
                        throw new Error("You must pass a meth (i.e. show, index, ...) to flush()");
                    }
                    var expectation = this._pendingExpectations()[meth] && this._pendingExpectations()[meth].shift();
                    if (!expectation) {
                        throw new Error('No '+meth+' requests pending.');
                    }
                    
                    expectation.resolve(); 
                    $rootScope.$apply();
                },
                
                _pendingQs: function() {
                    if (!this.__pendingQs) { 
                        this.__pendingQs = this._initialPendingHash();
                    }
                    return this.__pendingQs;
                },
                
                _pendingExpectations: function() {
                    if (!this.__pendingExpectations) { 
                        this.__pendingExpectations = this._initialPendingHash();
                    }
                    return this.__pendingExpectations;
                },
                
                _makeApiCall: function(collection, meth) {
                    var expectation = this._pendingExpectations()[meth][0]
                    if (!expectation) {
                        throw new Error('Unexpected call to '+meth+'.  You need to call expect("'+meth+'")');
                    };                 
                    return expectation.mockCalled();
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