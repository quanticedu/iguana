angular.module('Iguana')
    .factory('Iguana.SingleCollectionInheritance', function() {

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

                Iguana.setCallback('before', 'copyAttrsOnInitialize', function() {
                    var attrs = this.$$sourceAttrs;
                    if (!attrs || !attrs.$instantiatedWithNew) {
                        throw new Error("Iguana classes must be instantiated with MyKlass.new() rather that new MyKlass()");
                    }

                    delete attrs.$instantiatedWithNew;
                });
            },

            classMixin: {

                sciProperty: '__iguana_type',

                setSciProperty: function(prop) {
                    this.extend({
                        sciProperty: prop
                    });
                },

                new: function(attrs, raiseOnFailure) {
                    //clone the provided attrs object
                    attrs = angular.extend({}, attrs);

                    if (raiseOnFailure !== false) {
                        raiseOnFailure = true;
                    }
                    if (attrs === undefined) {
                        attrs = {};
                    }

                    if (typeof attrs !== 'object' || Object.prototype.toString.call(attrs) === '[object Array]') {
                        throw new Error("Expecting to instantiate Iguana class with object, got '" + attrs + "'");
                    }

                    //Ensure that all instances are created with Iguana.new rather than 'new Iguana'
                    //See after copyAttrs callback above
                    attrs.$instantiatedWithNew = true;

                    var instance;

                    // Since the lazy-loading relies on sciProperty, it can only work on subclasses. I guess this makes
                    // sense, since we'll always be loading things from the db with SomeItem.show() or 
                    // whatever.
                    if (!attrs.hasOwnProperty(this.sciProperty)) {
                        instance = new this(attrs);
                    } else if (attrs[this.sciProperty] && attrs[this.sciProperty] === this.alias()) {
                        instance = new this(attrs);
                    } else {
                        var klass
                        klass = this.getAliasedKlass(attrs[this.sciProperty], false);

                        if (klass && !klass.inheritsFrom(this)) {
                            throw new Error('Cannot instantiate because class "' + klass.alias() + '" does not inherit from "' + this.alias() + '."');
                        }

                        if (klass) {
                            instance = klass.new(attrs, false);
                        }

                    }

                    if (instance) {
                        return instance;
                    } else if (raiseOnFailure) {
                        throw new Error('No class could be found for ' + this.sciProperty + '="' + attrs[this.sciProperty] + '".');
                    }
                }
            }
        };
    });