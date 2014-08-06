'use strict';

angular.module('Iguana')
    .factory('Iguana.Keys', ['$injector',
        function() {

            return {

                classMixin: {
                    defineSetter: function(key, setter) {
                        var internalKey = this.internalKeyFor(key);

                        this.setCallback('after', 'copyAttrsOnInitialize', function() {

                            // if this property already exists, copy it to the internal key
                            if (this.hasOwnProperty(key)) {
                                this[internalKey] = this[key];
                            }

                            Object.defineProperty(this, key, {
                                get: function() {
                                    return this.readKey(key);
                                },
                                set: setter,
                                enumerable: true,
                                configurable: true // let developers mess with this if they want to
                            });
                        });
                    },

                    internalKeyFor: function(key) {
                        return '$$___' + key;
                    }
                },

                instanceMixin: {

                    readKey: function(key) {
                        var internalKey = this.constructor.internalKeyFor(key);
                        return this[internalKey];
                    },

                    writeKey: function(key, val) {
                        var internalKey = this.constructor.internalKeyFor(key);
                        this[internalKey] = val;
                        return val;
                    }

                }
            };

        }
    ]);