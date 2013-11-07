angular.module('Iguana')
.factory('Iguana.Mock.Adapter', ['Iguana.Adapters.AdapterBase', '$q', '$rootScope', 'AClassAbove', function(AdapterBase, $q, $rootScope, AClassAbove){
    
        var Expectation = AClassAbove.subclass(function() {
            
            this.extend({
                new: function(adapter, meth, result) {
                    var klass = {
                        'show': this.Show,
                        'index': this.Index,
                        'create': this.Create,
                        'update': this.Update,
                        'save': this.Save,
                        'destroy':  this.Destroy
                    }[meth];
                    if (!klass) {
                        throw new Error('Unexpected meth "'+meth+'"');
                    }
                    return new klass(adapter, result);
                }
            });
            
            return {
                initialize: function(adapter, meth, result) {
                    this.meth = meth;
                    this.adapter = adapter;
                    if (result) {
                        this.returns(result);
                    };
                    this.mockedMeta = null;
                    this.mockedError = null;
                    
                },
                
                spyOn: function(meth) {
                    try {
                        //We need a try/catch because, 
                        //if expect is called multiple times,
                        //then spyOn will complain about being 
                        //called twice on the same
                        //method.
                        spyOn(this.adapter, meth).andCallThrough();
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
                    if (Object.prototype.toString.call( response ) == '[object Array]') {
                        this.mockedResult = response;
                    } else if (!response.result && !response.meta && !response.error) {
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
                    
                    if (this.meth == "destroy" && this.mockedResult && angular.toJson(this.mockedResult) != "[]") {
                        throw new Error("destroy always returns an empty result, so you cannot mock out a different result.")
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
                
                methIs: function() {
                    return Array.prototype.slice.call(arguments, 0).indexOf(this.meth) > -1
                },
                
                resolve: function() {
                    var methName = this.meth;
                    var meth = this.adapter[methName];
                    if (this.meth == "save") {
                        if (this.adapter.update.calls.length > 0 ) {
                            meth = this.adapter.update;
                            methName = "save/update";
                        } else if (this.adapter.create.calls.length > 0 ) {
                            meth = this.adapter.create;
                            methName = "save/create";
                        }
                    }
                    
                    if (!meth || !meth.calls || meth.calls.length < 1) {
                        throw new Error('Expected '+methName+' to have been called, but it was not.');
                    }
                    
                    var call = meth.calls.shift();
                    var args = call.args;
                    var collection = args.shift();
                    
                    if (this.collection) {
                        if (collection != this.collection) {
                            throw new Error('Expected '+methName+' to have been called on the collection '+this.collection+' but it was called on '+collection+'.');
                        }
                    }
                                
                    if (this.methIs('create', 'update', 'save') && !this.mockedResult) {
                        this.returns(args[0]);
                    } else if (this.methIs('show', 'index') && !this.mockedResult) {
                        this.returns({});
                    } else if(this.methIs('destroy')) {
                        this.returns([]);
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
        
        Expectation.Show = Expectation.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'show', result);
                this.spyOn('show');
            }
        });
        
        Expectation.Index = Expectation.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'index', result);
                this.spyOn('index');
            }
        });
        
        Expectation.Create = Expectation.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'create', result);
                this.spyOn('create');
            }
        });
        
        Expectation.Update = Expectation.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'update', result);
                this.spyOn('update');
            }
        });
        
        Expectation.Save = Expectation.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'save', result);
                this.spyOn('create');
                this.spyOn('update');
            }
        });
        
        Expectation.Destroy = Expectation.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'destroy', result);
                this.spyOn('destroy');
            }
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
                    
                    var expectation = Expectation.new(this, meth);
                    if (collection) {
                        expectation.withCollection(collection);
                    }
                    if (expectedArgs) {
                        
                        expectation.toBeCalledWith(expectedArgs);
                    }
                    if (response) {
                        expectation.returns(response);
                    }
                    
                    if (!this._pendingExpectations()[meth]) {
                        throw new Error('"'+ meth +'" is not a supported method.  Supported methods are show/index/create/update/save/destroy');
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
                    if (!expectation && (meth == "create" || meth == "update")) {
                        expectation = this._pendingExpectations()['save'][0];
                    }
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
                        save: [],
                        destroy: []
                    };
                }
            };
            
        });
        
    }]);