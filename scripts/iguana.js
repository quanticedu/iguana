angular.module('Iguana', ['SuperModel', 'ngResource'])
.provider('Iguana', function(){
        
        this._defaultBaseUrl = '';
        
        this.setAdapter = function(adapterName) {
            this._defaultAdapterName = adapterName;
        };
        
        this.setBaseUrl = function(baseUrl) {
            this._defaultBaseUrl = baseUrl;
        }
        
        this.$get = [
            'SuperModel', 
            'Iguana.Alias',
            'Iguana.Callbacks',
            'Iguana.Crud',
            'Iguana.Embeds',
            'Iguana.Serializers',
            'Iguana.SingleCollectionInheritance', 
            
            function(SuperModel, Alias, Callbacks, Crud, Embeds, Serializers, SingleCollectionInheritance) {
                
                var plugins = Array.prototype.slice.call(arguments, 1);
                                
                var Iguana = SuperModel.subclass(function(){ 
                
                    angular.forEach(plugins, function(mixins){
                        this.extend(mixins.classMixin || {});
                        this.include(mixins.instanceMixin || {});
                        if (mixins.included) {
                            mixins.included(this);
                        }
                    }.bind(this));
                                    
                    return {
                        initialize: function(attrs) {
                            if (attrs === undefined) {
                                attrs = {};
                            }
                        
                            if (typeof attrs !== 'object' || Object.prototype.toString.call( attrs ) === '[object Array]') {
                                throw new Error("Expecting to instantiate Iguana class with object, got '"+attrs+"'");
                            }
                            this.copyAttrs(attrs);
                        },
                        
                        copyAttrs: function(attrs) {
                            this.$$sourceAttrs = angular.extend({}, attrs);
                            this.runCallbacks('copyAttrs', function() {
                                angular.extend(this, this.$$sourceAttrs);
                            });
                        }
                    }
                
                });
                
                if (this._defaultAdapterName) Iguana.setAdapter(this._defaultAdapterName);
                Iguana.setBaseUrl(this._defaultBaseUrl);
                            
                return Iguana;
            }];
        
    });