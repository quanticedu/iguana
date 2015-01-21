'use strict';

angular.module('Iguana')
    .factory('MockIguana', ['Iguana', '$q',
        function(Iguana, $q) {

            Iguana.setAdapter('Iguana.Mock.Adapter');

            Iguana.extend({

                expect: function(meth, args, response) {
                    var expectation = this.adapter().expect(meth).withCollection(this.collection);

                    // we really shouldn't accept args and response, but supporting
                    // some old tests
                    if (args) {
                        expectation.toBeCalledWith(args);
                    }

                    if (response) {
                        expectation.returns(response);
                    } else if (meth === 'index') {
                        expectation.returns([this.new()]);
                    } else if (meth === 'show' || meth === 'update' || meth === 'create') {
                        expectation.returns(this.new());
                    }

                    return expectation;
                },

                flush: function() {
                    this.adapter().flush.apply(this.adapter(), arguments);
                }

                // expectsSave: function() {
                //     //TODO: support flush()
                //     var deferred = $q.defer();
                //     spyOn(this, 'create').andReturn(deferred.promise);
                //     spyOn(this, 'update').andReturn(deferred.promise);
                // },
                // 
                // flush: function() {
                //     var call = this._pendingCalls().pop();
                //     if (!call) {
                //         throw new Error("No pending calls to flush.")
                //     }
                //     
                //     expect(this.show).toHaveBeenCalledWith(call.expectedArgs);
                //     
                // 
                // },
                // 
                // expectsShow: function(args, result, metadata) {
                //     
                //     var deferred = $q.defer();
                //     spyOn(this, 'show').andReturn(deferred.promise());
                //     
                //     this._pendingCalls().push({
                //         meth: 'show',
                //         expectedArgs: args,
                //         response: {
                //             result: result,
                //             metadata: metadata
                //         },
                //         deferred = deferred;
                //     });
                // },
                // 
                // _pendingCalls: function() {
                //     if (!this.__pendingCalls) {
                //         this.__pendingCalls = [];
                //     }
                //     return this.__pendingCalls;
                // }

            });

            // see also: https://github.com/angular/angular.js/commit/0d3b69a5f27b41745b504c7ffd8d72653bac1f85
            return {};

        }
    ]);