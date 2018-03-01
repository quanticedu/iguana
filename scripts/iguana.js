'use strict';

angular.module('Iguana', ['SuperModel', 'ngResource'])
    .provider('Iguana', function() {

        this._defaultBaseUrl = '';

        this.setAdapter = function(adapterName) {
            this._defaultAdapterName = adapterName;
        };

        this.setBaseUrl = function(baseUrl) {
            this._defaultBaseUrl = baseUrl;
        };

        this.setDefaultRequestOptions = function(opts) {
            this._defaultRequestOptions = opts;
        };


        this.$get = [
            'SuperModel',
            'Iguana.Alias',
            'Iguana.Callbacks',
            'Iguana.Crud',
            'Iguana.Embeds',
            'Iguana.Keys',
            'Iguana.Serializers',
            'Iguana.SingleCollectionInheritance',

            function(SuperModel, Alias, Callbacks, Crud, Embeds, Serializers, SingleCollectionInheritance) {

                var plugins = Array.prototype.slice.call(arguments, 1);

                var Iguana = SuperModel.subclass(function() {

                    angular.forEach(plugins, function(mixins) {
                        this.extend(mixins.classMixin || {});
                        this.include(mixins.instanceMixin || {});
                        if (mixins.included) {
                            mixins.included(this);
                        }
                    }.bind(this));

                    this.extendableObject('defaultRequestOptions');

                    this.extend({
                        expect: function() {
                            throw new Error('There is no \'expect\' method.  Make sure to include iguana-mock.js and inject MockIguana.');
                        },
                    });

                    return {
                        initialize: function(attrs) {
                            if (attrs === undefined) {
                                attrs = {};
                            }

                            if (typeof attrs !== 'object' || Object.prototype.toString.call(attrs) === '[object Array]') {
                                throw new Error('Expecting to instantiate Iguana class with object, got \'' + attrs + '\'');
                            }

                            this.copyAttrsOnInitialize(attrs);
                        },

                        copyAttrsOnInitialize: function(attrs) {
                            this.$$sourceAttrs = attrs;
                            this.runCallbacks('copyAttrsOnInitialize', function() {
                                this.copyAttrs();
                            });
                        },

                        copyAttrs: function(attrs) {
                            if (attrs) {
                                this.$$sourceAttrs = attrs;
                            }
                            this.runCallbacks('copyAttrs', function() {
                                angular.extend(this, this.$$sourceAttrs);
                            });
                        }
                    };

                });

                if (this._defaultAdapterName) {
                    Iguana.setAdapter(this._defaultAdapterName);
                }
                Iguana.setBaseUrl(this._defaultBaseUrl);

                if (this._defaultRequestOptions) {
                    angular.forEach(this._defaultRequestOptions, function(v, k) {
                        Iguana.defaultRequestOptions().set(k, v);
                    });
                }

                return Iguana;
            }
        ];

    });