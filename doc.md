Welcome to iguana documentation.

The most useful documentation is in our spec files:

 * [Basics](spec/basics_spec.html)
  * Creating an iguana class; fetching, saving, a deleting documents
 * [Testing](spec/mocks_spec.html)
  * Mocking out api calls
 * [Callbacks](spec/basics_spec.html)
  * Triggering actions on save, etc.
 * [Embedded Documents](spec/embeds_spec.html)
  * Assigning classes to sub-documents inside of your main document
 * [Keys](spec/keys_spec.html)
  * Setting up special functionality (like side-effects in a setter) on particular properties in your document.
 * [Single Collection Inheritance (polymorphism)](spec/single_collection_inheritance_spec.html)
  * Assigning different classes to documents from the same collection
 * [Serializers](spec/serializers_spec.html)
  * asJson and toJson
 * Adapters
  * [RestfulIdStyle](spec/adapters/restful_id_style_spec.html)

For information about creating new adapters, see [AdapterBase](scripts/adapters/adapter_base.html)
