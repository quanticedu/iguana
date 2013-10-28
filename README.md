# Iguana

Object-Document Mapper (ODM) for angular

Iguana is an Object-Document Mapper for angular. It is currently in version 0.0.x
and still has a long way to go.

Current features:

 * *Single-collection inheritance (polymorphism)* - assign different classes to different documents
   in a single collection.
 * *Embedded documents* - assign classes to sub-documents inside of arrays or objects inside of your document
 * *Swappable API layer* - build an adapter to allow Iguana to work with whatever CRUD API you happen to be using 


### Installation

From the command line:
    
    bower install iguana

From the bower.json file
    
    {
	    "...
	    "dependencies": {
	        "iguana": "0.0.1"
	    },
		...
	}
	
In your html

    <script type="text/javascript" src="bower_components/iguana/dist/iguana.js"></script>
or

    <script type="text/javascript" src="bower_components/iguana/dist/iguana.min.js"></script>

### Documentation

[0.0.1](http://www.pedago.com/iguana/docs/0.0.1)