angular.module('Iguana')
.factory('Iguana.SingleCollectionInheritance', function(){
        
        return {
            classMixin: {
                
                sciProperty: 'iguana_type',
                
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
                    else if (attrs[this.sciProperty] && attrs[this.sciProperty] === this.alias) {
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