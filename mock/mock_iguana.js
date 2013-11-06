angular.module('Iguana')
.factory('MockIguana', ['Iguana', '$q', function(Iguana, $q){
    
    Iguana.setAdapter('Iguana.Mock.Adapter');
    
    Iguana.extend({
        
        expect: function(meth, args, response) {
            if( Object.prototype.toString.call( args ) !== '[object Array]' ) {
                args = [args];
            }
            
            var result = response.result;
            if( Object.prototype.toString.call( result ) !== '[object Array]' ) {
                result = [result];
            }
            
            var _result = [];
            angular.forEach(result, function(instance){
                _result.push(instance.asJson ? instance.asJson() : instance);
            });
            this.adapter().expect(
                meth, 
                this.collection, 
                args, 
                {result: _result, meta: response.meta}
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