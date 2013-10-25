angular.module('Iguana')
.factory('Iguana.Adapters.AdapterBase', ['$q', 'SuperModel', function($q, SuperModel){
        
        return SuperModel.subclass(function() {
            
            return {
                initialize: function(iguanaKlass) {
                    this.iguanaKlass = iguanaKlass;
                },
                show: function(collection, arg1, arg2) {
                    throw new Error("Adapter does not support show method");
                },
                index: function(collection, arg1, arg2) {
                    throw new Error("Adapter does not support index method");
                },
                create: function(collection, arg1, arg2) {
                    throw new Error("Adapter does not support create method");
                },
                update: function(collection, arg1, arg2) {
                    throw new Error("Adapter does not support update method");
                },
                destroy: function(collection, arg1, arg2) {
                    throw new Error("Adapter does not support destroy method");
                }
            };
        })
        
    }]);