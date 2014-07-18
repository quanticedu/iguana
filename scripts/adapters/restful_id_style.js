'use strict';

angular.module('Iguana.Adapters.RestfulIdStyle', ['Iguana', 'ngResource'])
    .factory('Iguana.Adapters.RestfulIdStyle', ['Iguana.Adapters.AdapterBase', '$resource', '$q',
        function(AdapterBase, $resource, $q) {

            // based on the id-style described at https://gist.github.com/wycats/5500104

            return AdapterBase.subclass(function() {

                return {

                    name: 'Iguana.Adapters.RestfulIdStyle',

                    index: function(collection, params) {
                        return this._makeApiCall(collection, 'index', params);
                    },

                    show: function(collection, id, params) {
                        if (!id) {
                            throw new Error('No id provided');
                        }
                        params = params || {};
                        params[this.idProperty] = id;
                        return this._makeApiCall(collection, 'show', params);
                    },

                    create: function(collection, obj, metadata) {
                        return this._makeApiCall(collection, 'create', {
                            record: obj,
                            meta: metadata
                        });
                    },

                    update: function(collection, obj, metadata) {
                        return this._makeApiCall(collection, 'update', {
                            record: obj,
                            meta: metadata
                        });
                    },

                    destroy: function(collection, id) {
                        if (!id) {
                            throw new Error('No id provided');
                        }
                        var params = {};
                        params[this.idProperty] = id;
                        return this._makeApiCall(collection, 'destroy', params);
                    },

                    _makeApiCall: function(collectionName, meth, params) {
                        var deferred = $q.defer();
                        var resource = this._getResource(collectionName);
                        var collection = this.iguanaKlass.collection;
                        if (!collection) {
                            throw new Error('No collection defined on iguana class.');
                        }
                        resource[meth](
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

                    _getResource: function(collection) {
                        var url = [this.iguanaKlass.baseUrl, collection, ':' + this.idProperty].join('/') + '.json';
                        return $resource(url, {}, {
                            'index': {
                                method: 'GET'
                            },
                            'show': {
                                method: 'GET'
                            },
                            'create': {
                                method: 'POST'
                            },
                            'update': {
                                method: 'PUT'
                            },
                            'destroy': {
                                method: 'DELETE'
                            }
                        });
                    }

                };

            });

        }
    ]);