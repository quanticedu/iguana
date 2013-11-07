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
                
                withCollection: function(collection) {
                    this.collection = collection;
                    return this;
                },
                
                toBeCalledWith: function(args) {
                    if (Object.prototype.toString.call( args ) !== '[object Array]') {
                        args = [args];
                    }
                    this.expectedArgs = [];
                    angular.forEach(args, function(arg){
                        this.expectedArgs.push(arg.asJson ? arg.asJson() : arg);
                    }.bind(this));
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
                
                resolve: function(actualMeth, displayName) {
                    //see Save class below
                    if (!actualMeth) {
                        actualMeth = this.meth; 
                    }
                    
                    //see Save class below
                    if (!displayName) {
                        displayName = this.meth;
                    }
                    var meth = this.adapter.getCalledMethod(actualMeth);
                                        
                    if (!meth) {
                        throw new Error('Expected '+displayName+' to have been called, but it was not.');
                    }
                    
                    var call = meth.calls.shift();
                    var args = call.args;
                    var collection = args.shift();
                    
                    if (this.collection) {
                        if (collection != this.collection) {
                            throw new Error('Expected '+displayName+' to have been called on the collection '+this.collection+' but it was called on '+collection+'.');
                        }
                    }
                    
                    if (!this.mockedResult) {
                        this.returns(this.defaultResult(args));
                    }
                    
                    console.log(this.mockedResult);
                    
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
                    
                },
                
                //private
                methIs: function() {
                    return Array.prototype.slice.call(arguments, 0).indexOf(this.meth) > -1
                }
            };
            
        });   
        
        Expectation.SuperGet = Expectation.subclass({
            defaultResult: function(args) {
                return {};
            }
        });
        
        Expectation.Show = Expectation.SuperGet.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'show', result);
            }
        });
        
        Expectation.Index = Expectation.SuperGet.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'index', result);
            }
        });
        
        Expectation.SuperSave = Expectation.subclass({
            defaultResult: function(args) {
                return args[0];
            }
        });
        
        Expectation.Create = Expectation.SuperSave.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'create', result);
            }
        });
        
        Expectation.Update = Expectation.SuperSave.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'update', result);
            }
        });
        
        Expectation.Save = Expectation.SuperSave.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'save', result);
            },
            
            resolve: function($super) {
                if (this.adapter.update.calls.length > 0 ) {
                    $super('update', 'save/update');
                } else if (this.adapter.create.calls.length > 0 ) {
                    $super('create', 'save/create');
                } else {
                    throw new Error('Expected create or update to have been called, but neither was.');
                }
            }
        });
        
        Expectation.Destroy = Expectation.subclass({
            
            initialize: function($super, adapter, result) {
                $super(adapter, 'destroy', result);
            },
            
            returns: function($super, response) {
                $super(response);
                
                if (this.mockedResult && angular.toJson(this.mockedResult) != "[]") {
                    throw new Error("destroy always returns an empty result, so you cannot mock out a different result.")
                }
            },
            
            defaultResult: function(args) {
                return [];
            }
        });
        
        
        
        
        return AdapterBase.subclass(function() {
            
            return {
                name: 'Iguana.Mock.Adapter',
                
                initialize: function($super, iguanaKlass) {
                    $super(iguanaKlass);
                    this.setSpies();
                },
                
                setSpies: function() {
                    angular.forEach(['show', 'index', 'create', 'update', 'destroy'], function(meth){
                        spyOn(this, meth).andCallThrough();
                    }.bind(this));
                },
                
                show: function(collection, arg1, arg2) {
                    console.log('show called on ', this.iguanaKlass.alias());
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
                    
                    this._pendingExpectations(meth).push(expectation);
                    
                    return expectation;
                },
                
                flush: function(meth) {
                    if (!meth) {
                        throw new Error("You must pass a meth (i.e. show, index, ...) to flush()");
                    }
                    
                    
                    var expectation = this.shiftPendingExpectation(meth);
                    if (!expectation) {
                        throw new Error('No '+meth+' requests pending.');
                    }
                    
                    expectation.resolve(); 
                    $rootScope.$apply();
                },
                
                getCalledMethod: function(methName) {
                    var meth = this[methName];
                    if (!meth || !meth.calls || meth.calls.length == 0) {
                        //If any subclasses have called this method, then 
                        //that counts
                        var subMeth;
                        angular.forEach(this.subAdapters(), function(adapter){
                            subMeth = adapter.getCalledMethod(methName);
                        });
                        if (subMeth) { return subMeth; }
                    } else {
                        return meth;
                    }
                    
                    return null;
                },
                
                getPendingExpectation: function(meth) {
                    var expectations = this._pendingExpectations(meth);
                    if (expectations.length > 0) {
                        return expectations[0];
                    } else if (this.superAdapter()) {
                        return this.superAdapter().getPendingExpectation(meth);
                    }
                    
                    return null;
                },
                
                shiftPendingExpectation: function(meth) {
                    var expectations = this._pendingExpectations(meth);
                    if (expectations.length > 0) {
                        return expectations.shift();
                    } else if (this.superAdapter()) {
                        return this.superAdapter().shiftPendingExpectation();
                    }
                    
                    return null;
                },
                
                superAdapter: function() {
                    var superAdapter;
                    if (this.iguanaKlass.superclass && this.iguanaKlass.superclass.adapter){
                        superAdapter = this.iguanaKlass.superclass.adapter();
                    };
                    if (superAdapter && superAdapter.constructor == this.constructor) {
                        return superAdapter;
                    }
                },
                
                subAdapters: function() {
                    var adapters = [];
                    angular.forEach(this.iguanaKlass.subclasses, function(subclass){
                        adapters.push(subclass.adapter());
                    });
                    return adapters;
                },
                
                _pendingExpectations: function(meth) {
                    if (!this.__pendingExpectations) { 
                        this.__pendingExpectations = this._initialPendingHash();
                    }
                    if (meth) {
                        var expectations = this.__pendingExpectations[meth];
                        if (!expectations) {
                            throw new Error('"'+ meth +'" is not a supported method.  Supported methods are show/index/create/update/save/destroy');
                        }
                        return expectations;
                    }
                    
                    return this.__pendingExpectations;
                },
                
                _makeApiCall: function(collection, meth) {
                    var expectation = this.getPendingExpectation(meth);
                    if (!expectation && (meth == "create" || meth == "update")) {
                        expectation = this.getPendingExpectation('save');
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