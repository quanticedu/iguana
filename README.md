# Iguana

Object-Document Mapper (ODM) for angular

Iguana is an Object-Document Mapper for angular. It is currently in version 0.0.x
and still has a long way to go.

Current features:

 * **Single-collection inheritance (polymorphism)** - assign different classes to different documents
   in a single collection.
 * **Embedded documents** - assign classes to sub-documents inside of arrays or objects inside of your document
 * **Swappable API layer** - build an adapter to allow Iguana to work with whatever CRUD API you happen to be using 

### Installation

From the command line:
    
    bower install iguana

From the bower.json file
    
    {
	    "...
	    "dependencies": {
	        "iguana": "0.0.10"
	    },
		...
	}
	
In your html

	<script type="text/javascript" src="bower_components/a-class-above/dist/a_class_above.js"></script>
	<script type="text/javascript" src="bower_components/super-model/dist/super_model.js"></script>
    <script type="text/javascript" src="bower_components/iguana/dist/iguana.js"></script>
or

	<script type="text/javascript" src="bower_components/a-class-above/dist/a_class_above.min.js"></script>
	<script type="text/javascript" src="bower_components/super-model/dist/super_model.min.js"></script>
    <script type="text/javascript" src="bower_components/iguana/dist/iguana.min.js"></script>

### Dependencies

iguana uses [a-class-above](https://github.com/pedago/a-class-above) for OOP and 
[super-model](https://github.com/pedago/super-model) for callbacks.  Please see the documentation
in those projects for more information.

### Documentation

[0.0.9](http://pedago.github.io/iguana/docs/0.0.9)  
[0.0.8](http://pedago.github.io/iguana/docs/0.0.8)  
[0.0.7](http://pedago.github.io/iguana/docs/0.0.7)  
[0.0.6](http://pedago.github.io/iguana/docs/0.0.6)  
[0.0.5](http://pedago.github.io/iguana/docs/0.0.5)  
[0.0.4](http://pedago.github.io/iguana/docs/0.0.4)  
[0.0.3](http://pedago.github.io/iguana/docs/0.0.3)  
[0.0.2](http://pedago.github.io/iguana/docs/0.0.2)  
[0.0.10](http://pedago.github.io/iguana/docs/0.0.10)  
[0.0.1](http://pedago.github.io/iguana/docs/0.0.1)  
