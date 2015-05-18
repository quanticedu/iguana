angular.module('Iguana')
    .factory('Iguana.Alias', ['$injector',
        function($injector) {

            return {
                classMixin: {

                    injectablesMap: {},

                    alias: function(value) {
                        if (value) {
                            this._alias = value;
                            if (this._aliasedKlasses[value]) {
                                throw new Error('A klass has already been aliased to "' + value + '".  Cannot alias another to the same name.');
                            }
                            this._aliasedKlasses[value] = this;
                        }
                        return this._alias;
                    },

                    getAliasedKlass: function(alias, throwIfUnfound) {
                        if (angular.isUndefined(throwIfUnfound)) {
                            throwIfUnfound = true;
                        }
                        if (!this._aliasedKlasses[alias]) {
                            var path = this.injectablesMap[alias];
                            if (path && $injector.has(path)) {
                                var klass;
                                klass = $injector.get(path);
                                this._aliasedKlasses[alias] = klass;
                                if (alias !== klass.alias()) {
                                    var message = 'Class included in injectablesMap does not have the expected alias: "' + klass.alias() + '" != "' + alias + '"';
                                    throw new Error(message);
                                }
                            }
                        }

                        if (!this._aliasedKlasses[alias] && throwIfUnfound) {
                            throw new Error('No class aliased to "' + alias + '".');
                        }
                        return this._aliasedKlasses[alias];
                    },

                    mapInjectables: function(obj) {
                        angular.extend(this.injectablesMap, obj);
                    },

                    // this same object will be shared between all subclasses of Iguana, 
                    // so any class can access any aliased class
                    _aliasedKlasses: {}
                }
            };
        }
    ]);