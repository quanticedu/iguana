angular.module('Iguana')
.factory('Iguana.Mock', ['Iguana', '$q', function(Iguana, $q){
    
    Iguana.setAdapter('Iguana.Mock.Adapter');
    
    Iguana.extend({
        
        expectsShow: function(args, result, meta) {
            this.adapter().expect(
                'show', 
                this.collection, 
                args, 
                {result: [result.asJson()], meta: meta}
            );
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
    
}]);