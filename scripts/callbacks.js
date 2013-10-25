angular.module('Iguana')
.factory('Iguana.Callbacks', [function(){
        
        
        return {
            included: function(Iguana) {
                Iguana.defineCallbacks('copyAttrs');
            }
        };
        
    }]);