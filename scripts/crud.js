angular.module('Iguana')
.factory('Iguana.Crud', ['$injector', function($injector){
                
        return {
            
            included: function(Iguana) {
                Iguana.setIdProperty('id');
            },
            
            classMixin: {
                
                setCollection: function(collection) {
                    this.extend({collection: collection});
                },
                
                setAdapter: function(adapterName) {
                    try {
                        var adapterKlass = $injector.get(adapterName);
                    } catch(e) {
                        throw new Error('Cannot find adapter "'+adapterName+'"');
                    }
                    
                    this.extend({adapterKlass: adapterKlass});
                },
                
                setBaseUrl: function(url) {
                    //remove trailing slash
                    url = url.replace(/\/$/, "");
                    this.extend({baseUrl: url});
                },
                
                setIdProperty: function(idProperty) {
                    this.extend({idProperty: idProperty});
                },
                
                adapter: function() {
                    if (!this._adapter) {
                        if (!this.adapterKlass) {
                            throw new Error("No adapter set.  You need to call setAdapter()");
                        }
                        this._adapter = new this.adapterKlass(this);
                    }
                    return this._adapter;
                },
                
                show: function(arg1, arg2) {
                    return this._callAdapterMethAndInstantiateResult('show', true, arguments);
                },
                
                index: function(arg1, arg2) {
                    return this._callAdapterMethAndInstantiateResult('index', false, arguments);
                },
                
                create: function(obj) {
                    var instance = this.new(obj);
                    if (!instance.isNew()) {
                        throw new Error("Cannot call create on instance that is already saved.");
                    }
                    return instance.save();
                },
                
                update: function(obj) {
                    var instance = this.new(obj);
                    if (instance.isNew()) {
                        throw new Error("Cannot call update on instance that is not already saved.");
                    }
                    return instance.save();
                },
                
                destroy: function(id) {
                    var klass = this;                    
                    return this._callAdapterMeth('destroy', [id]).then(function(response){
                        return this._prepareEmptyResponse(response);
                    }.bind(this));
                },
                
                saveWithoutInstantiating: function(meth, obj) {
                    return this._callAdapterMeth(meth, [obj]).then(function(response){
                        return {
                            result: response.result[0],
                            meta: response.meta
                        };
                    });
                },
                
                _prepareEmptyResponse: function(response) {
                    return {
                        result: null,
                        meta: response.meta
                    };
                },
                
                _callAdapterMethAndInstantiateResult: function(meth, singlify, args) {
                    return this._callAdapterMeth(meth, args).then(function(response){
                        return this._instantiateFromResponse(singlify, response);
                    }.bind(this));
                },
                
                _instantiateFromResponse: function(singlify, response) {
                    var instances = this._instantiateFromResult(response.result);
                    var result = singlify ? instances[0] : instances;          
                    return {
                        result: result,
                        meta: response.meta
                    };
                },
                
                _instantiateFromResult: function(result) {
                    if (!result) { return []; }
                    var instances = [];
                    angular.forEach(result, function(attrs){
                        instances.push(this.new(attrs));
                    }.bind(this));
                    return instances;
                },
                
                _callAdapterMeth: function(meth, args) {
                    if (!this.collection) {
                        throw new Error('Cannot make an api call because collection has not been set.  You need to call setCollection().')
                    }
                    args = Array.prototype.slice.call(args, 0);
                    args.unshift(this.collection);
                    return this.adapter()[meth].apply(this.adapter(), args);
                }
            },
            
            instanceMixin: {
                
                save: function() {
                    var returnValue;
                    this.runCallbacks('save', function() {
                        returnValue = this._save();
                    });
                    return returnValue;
                },
                
                isNew: function() {
                    var id = this[this.idProperty()];
                    return !id;
                },
                
                _save: function() {
                    var action = this.isNew() ? "create" : "update"; 
                    
                    return this.constructor.saveWithoutInstantiating(action, this.asJson()).then(function(response){
                        var attrs = angular.extend({}, response.result);
                        
                        this.copyAttrs(attrs);
                        return {
                            result: this,
                            meta: response.meta
                        };
                    }.bind(this));
                },
                
                destroy: function() {
                    return this.constructor.destroy(this[this.idProperty()]);
                },
                
                idProperty: function() {
                    return this.constructor.idProperty;
                }
                
            }
        };
        
    }]);