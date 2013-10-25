angular.module('Iguana')
.factory('Iguana.Alias', function(){
        
        return {
            classMixin: {
                
                alias: function(value) {
                    this.alias = value;
                    if (this._aliasedKlasses[value]) {
                        throw new Error('A klass has already been aliased to "'+value+'".  Cannot alias another to the same name.');
                    }
                    this._aliasedKlasses[value] = this;
                    return this;
                },
                
                getAliasedKlass: function(alias) {
                    if (!this._aliasedKlasses[alias]) {
                        throw new Error('No class aliased to "'+alias+'".');
                    }
                    return this._aliasedKlasses[alias];
                },
                
                // this same object will be shared between all subclasses of Iguana, 
                // so any class can access any aliased class
                _aliasedKlasses: {}
            }
        };
    });