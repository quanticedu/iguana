'use strict';

angular.module('Iguana.Adapters.RestfulIdStyle', ['Iguana', 'ngResource'])
    .factory('Iguana.Adapters.RestfulIdStyle', ['Iguana.Adapters.AdapterBase', '$resource', '$q',
        function(AdapterBase, $resource, $q) {

            // based on the id-style described at https://gist.github.com/wycats/5500104

            return AdapterBase.subclass(function() {

                return {

                    name: 'Iguana.Adapters.RestfulIdStyle',

                    index: function(collection, params, options) {
                        return this._makeApiCall(collection, 'index', params, options);
                    },

                    show: function(collection, id, params, options) {
                        if (!id) {
                            throw new Error('No id provided');
                        }
                        params = params || {};
                        params[this.idProperty] = id;
                        return this._makeApiCall(collection, 'show', params, options);
                    },

                    create: function(collection, obj, metadata, options) {
                        return this._makeApiCall(collection, 'create', {
                            record: obj,
                            meta: metadata
                        }, options);
                    },

                    update: function(collection, obj, metadata, options) {
                        return this._makeApiCall(collection, 'update', {
                            record: obj,
                            meta: metadata
                        }, options);
                    },

                    destroy: function(collection, id, options) {
                        if (!id) {
                            throw new Error('No id provided');
                        }
                        var params = {};
                        params[this.idProperty] = id;
                        return this._makeApiCall(collection, 'destroy', params, options);
                    },

                    _makeApiCall: function(collectionName, meth, params, options) {
                        var deferred = $q.defer();
                        var resource = this._getResource(collectionName, options);
                        var collection = this.iguanaKlass.collection;
                        if (!collection) {
                            throw new Error('No collection defined on iguana class.');
                        }
                        var func = resource[meth];
                        if (!func) {
                            var props = {
                                collectionName: collectionName,
                                meth: meth
                            };
                            throw new Error('No func available for "' + meth + '": ' + angular.toJson(props));
                        }
                        func(
                            params,
                            function(response) {
                                var contents = response.contents;
                                if (!contents) {
                                    throw new Error('Malformed response: "' + angular.toJson(response) + '"');
                                }
                                deferred.resolve({
                                    result: contents[collection] || [],
                                    meta: response.meta
                                });
                            },
                            function(error) {
                                deferred.reject(error);
                            });
                        return deferred.promise;
                    },

                    _getResource: function(collection, options) {
                        var url = [this.iguanaKlass.baseUrl, collection, ':' + this.idProperty].join('/') + '.json';
                        options = angular.extend({}, this.iguanaKlass.defaultRequestOptions(), options || {});
                        var timeout;
                        var unsupportedOptions = [];

                        // currently, the only supported option is timeout
                        Object.keys(options).forEach(function(key) {
                            if (key === 'timeout') {
                                timeout = options.timeout;
                            } else {
                                unsupportedOptions.push(key);
                            }
                        });

                        if (unsupportedOptions.length > 0) {
                            throw new Error('Unsupported options: "' + unsupportedOptions.join(',') + '"');
                        }

                        return $resource(url, {}, {
                            'index': {
                                method: 'GET',
                                timeout: timeout
                            },
                            'show': {
                                method: 'GET',
                                timeout: timeout
                            },
                            'create': {
                                method: 'POST',
                                timeout: timeout
                            },
                            'update': {
                                method: 'PUT',
                                timeout: timeout
                            },
                            'destroy': {
                                method: 'DELETE',
                                timeout: timeout
                            }
                        });
                    }

                };

            });

        }
    ]);