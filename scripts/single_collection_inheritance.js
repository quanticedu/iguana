angular.module('Iguana')
.factory('Iguana.SingleCollectionInheritance', function(){
        
        return {
            
            included: function(Iguana) {
                // if the class has an alias, but the type property is 
                // not set, then set it to the alias.
                Iguana.setCallback('after', 'copyAttrs', function() {
                    var sciProperty = this.constructor.sciProperty;
                    if (this.constructor.alias() && !this.hasOwnProperty(sciProperty)) {
                        this[sciProperty] = this.constructor.alias();
                    }
                });
            },
            
            classMixin: {
                
                sciProperty: '__iguana_type',
                
                setSciProperty: function(prop) {
                    this.extend({sciProperty: prop});
                },

                new: function(attrs, raiseOnFailure) {
                    if (raiseOnFailure !== false) {
                        raiseOnFailure = true;
                    }
                    if (attrs === undefined) {
                        attrs = {};
                    }
                    
                    if (typeof attrs !== 'object' || Object.prototype.toString.call( attrs ) === '[object Array]') {
                        throw new Error("Expecting to instantiate Iguana class with object, got '"+attrs+"'");
                    }
                    
                    var instance;
                    if (!attrs.hasOwnProperty(this.sciProperty)) {
                        return new this(attrs);
                    }
                    else if (attrs[this.sciProperty] && attrs[this.sciProperty] === this.alias()) {
                        instance = new this(attrs);
                    } else {
                        for (var i = 0; i < this.subclasses.length; i++) {
                            var subclass = this.subclasses[i];
                            instance = subclass.new(attrs, false);
                            if (instance) { break; }
                        }
                    }

                    if (instance) {
                        return instance;
                    } else if (raiseOnFailure) {
                        throw new Error('No class could be found for '+this.sciProperty+'="'+attrs[this.sciProperty]+'".');
                    }
                }
            }
        };
    });