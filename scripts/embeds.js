 angular.module('Iguana')
.factory('Iguana.Embeds', ['AClassAbove', function(Class){
        
        var EmbedRelationship = Class.subclass({
            initialize: function(propName, klassFetcher) {
                // We don't want to worry about whether the class has been aliased or
                // yet when the relationship is set up.  So long as it has been aliased by the
                // time we try to process a relationship, that's good enough.  So we take
                // a function that will let us fetch the klass just in time.
                this.propName = propName;
                this.klassFetcher = klassFetcher;
            },
            
            process: function(parent, attrs) {
                var sourceValue = attrs[this.propName];
                if (!sourceValue) return;                
                attrs[this.propName] = this._instantiate(parent, sourceValue); 
            }
        });
        
        var EmbedManyRelationship = EmbedRelationship.subclass({
            
            _instantiate: function(parent, sourceValue) {
                var target;
                
                // figure out if we are dealing with an array or an object
                if (Object.prototype.toString.call( sourceValue ) === '[object Array]' ) {
                    target = [];
                } else if (typeof sourceValue === 'object') {
                    target = {};
                } else {
                    throw new Error('Expecting array or object for embedsMany relationship "'+this.propName+'". Got '+sourceValue);
                }
                
                angular.forEach(sourceValue, function(val, key){
                    var instance = this.klassFetcher().new(val);
                    instance.$$embeddedIn = parent;
                    target[key] = instance;
                }.bind(this));
                
                return target;
            }
            
        });
        
        var EmbedOneRelationship = EmbedRelationship.subclass({
            
            _instantiate: function(parent, sourceValue) {
                var instance = this.klassFetcher().new(sourceValue);
                instance.$$embeddedIn = parent;
                return instance;
            }
            
        });
        
        return {
            
            included: function(Iguana) {
                Iguana.extendableObject('embedRelationships');
                Iguana.setCallback('before', 'copyAttrs', 'processEmbeds');

                // // We would like to bring this back, but it can
                // // case MaxCallStack errors in Chrome.  Maybe
                // // we can eventually find a solution
                // Iguana.setCallback('around', 'save', function(save) {
                //     var wrapped = save;
                // 
                //     
                //     
                //     // var relationships = this.embedRelationships();
                //     // for (var propName in relationships) {
                //     //     if (!relationships.hasOwnProperty(propName)) { 
                //     //         continue
                //     //     }
                //     //     var relationship = relationships[propName];
                //     //     var value = this[propName];
                //     //     if (value) {
                //     //         var isArray = (Object.prototype.toString.call(value) === '[object Array]');
                //     //         var values = isArray ? value : [value];
                //     //         values.forEach(function(item) {
                //     //             var reWrapped = function(wrapped) {
                //     //                 item.runCallbacks('save', wrapped);
                //     //             }.bind(item, wrapped);
                //     //             wrapped = reWrapped;
                //     //         });
                //     //     }
                //     // }
                // 
                //     wrapped();
                // });
            },
            
            classMixin: {
                
                embedsMany: function(propName, classAlias) {
                    this.embedRelationships().set(propName, new EmbedManyRelationship(
                        propName, 
                        this.getAliasedKlass.bind(this, classAlias)
                    ));
                },
                
                embedsOne: function(propName, classAlias) {
                    this.embedRelationships().set(propName, new EmbedOneRelationship(
                        propName,
                        this.getAliasedKlass.bind(this, classAlias)
                    ));
                },
                
                embeddedIn: function(propName) {
                    this.extend({'_embeddedIn': propName});
                    var obj = {};
                    obj[propName] = function() {
                        return this.$$embeddedIn;
                    };
                    this.include(obj);
                }
            },
            
            instanceMixin: {
                embedRelationships: function() {
                    return this.constructor.embedRelationships.apply(this.constructor);
                },
                
                processEmbeds: function(){           
                    angular.forEach(this.embedRelationships(), function(relationship){
                        relationship.process(this, this.$$sourceAttrs);
                    }.bind(this));
                }                
            }
        };
    }]);