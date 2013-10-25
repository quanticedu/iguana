'use strict';

describe('Iguana.SingleCollectionInheritance', function() {

    var Iguana, Klass;

    beforeEach(function() {
        module('Iguana');

        inject(function(_Iguana_) {
            Iguana = _Iguana_;
            Klass = Iguana.subclass(function() {
                this.setSciProperty('___type');
                this.alias('myklass');
            });
        });

    });
    
    describe('sciProperty', function() {
        
        it('should default to iguana_type', function() {
            expect(Iguana.sciProperty).toBe('iguana_type');
            expect(Iguana.subclass().sciProperty).toBe('iguana_type');
        });
        
    });
    
    describe('new', function() {
        
        it('should create an instance of the class if there is no type property', function() { 
            var instance = Klass.new({});
            expect(instance.constructor).toBe(Klass);
        });
        
        it('should create an instance of the class if the type property matches the sciAlias', function() {
            var instance = Klass.new({___type: 'myklass'});
            expect(instance.constructor).toBe(Klass);
        });
        
        it('should create an instance of a subclass if the attributes match the subclass polyMorph settings', function() {
            var SubClass1 = Klass.subclass(function() {
                this.alias('subclass1');
            });
            var SubClass2 = Klass.subclass(function() {
                this.alias('subclass2');
            });
            var instance = Klass.new({___type: 'subclass2'});
            expect(instance.constructor).toBe(SubClass2);
        });
        
        it('should raise if nothing matches the polyMorph settings', function() {
            expect(Klass.new.bind(Klass, {___type: 'noKlassForThis'})).toThrow('No class could be found for ___type="noKlassForThis".');
        });
        
    });

    
});
