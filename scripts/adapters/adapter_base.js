'use strict';

angular.module('Iguana')
    .factory('Iguana.Adapters.AdapterBase', ['$q', 'SuperModel',
        function($q, SuperModel) {

            /**
                # Creating adapters
                To create a new adapter, you will need to create a new service that
                subclasses Iguana.Adapters.AdapterBase.
                For an example, see [Iguana.Adapters.RestfulIdStyle](restful_id_style.html)

                Your subclass should define some or all of the methods described below.

                All methods should return a promise which will be resolved with an
                object that has the following two properties:

                **result** - an array of documents.
                **metadata** - anything you want it to be.
            */

            return SuperModel.subclass(function() {

                return {
                    initialize: function(iguanaKlass) {
                        this.iguanaKlass = iguanaKlass;
                    },

                    // ### show
                    // Any arguments passed to Iguana.show will be passed through to
                    // the adapter, allowing the adapter to support any kind of
                    // querying functionality.
                    //
                    // The 'result' array should have only a single document.  Any
                    // subsequent documents will be ignored.
                    show: function() {
                        throw new Error('Adapter does not support show method');
                    },

                    // ### index
                    // Any arguments passed to Iguana.index will be passed through to
                    // the adapter, allowing the adapter to support any kind of
                    // querying functionality.
                    //
                    // The 'result' array can have any number of documents
                    index: function() {
                        throw new Error('Adapter does not support index method');
                    },

                    // ### create
                    // A document will be passed to create
                    //
                    // The 'result' array should have only a single document.  Any
                    // subsequent documents will be ignored.
                    create: function() {
                        throw new Error('Adapter does not support create method');
                    },

                    // ### update
                    // A document will be passed to update
                    //
                    // The 'result' array should have only a single document.  Any
                    // subsequent documents will be ignored.
                    update: function() {
                        throw new Error('Adapter does not support update method');
                    },

                    // ### destroy
                    // An id will be passed to destroy.  (Maybe we need to support other
                    // querying functionality here as well?)
                    //
                    // The 'result' array should be empty.  Any contents will be ignored.
                    destroy: function() {
                        throw new Error('Adapter does not support destroy method');
                    }
                };
            });

        }
    ]);