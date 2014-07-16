# Model Persistence
Persistence responsibilities are divided between:

- `Batman.Model` encoders, which define serialization of model attributes
- Storage adapters, which perform storage operations with serialized data.

## Encoders

Persisted model attributes are defined with _encoders_. These are directives that tell
batman.js to load certain keys from serialized data.

To encode and decode an attribute without transformation, pass one or more attribute names to `@encode`:

```coffeescript
class MyApp.Product extends Batman.Model
  @encode 'title', 'description', 'price'

class MyApp.Subscription extends MyApp.Product
  # Subscription inherits all encoders from MyApp.Product
  @encode 'period'
```

You can also define functions for encoding and decoding values by passing functions along with the attribute name(s):

```coffeescript
class MyApp.Product extends Batman.Model
  @encode 'price',
    encode: (value, key, outgoingJSON, record) ->
      # adds values from `record` to `outgoingJSON`
    decode: (value, key, incomingJSON, outgoingAttributes, record) ->
      # takes values from `incomingJSON` and adds them to `outgoingAttributes`,
      # so they can be mixed into the record
```

See the [`Model.encode` API docs](/docs/api/batman.model.html#class_function_encode) for more information about custom encoders.

Also, model associations (`@belongsTo`, `@hasMany`, etc) define their own encoders.

## Storage Adapters

Storage adapters (subclasses of `Batman.StorageAdapter`) handle persistence operations: `create`, `read`, `update`, `destroy` and `readAll`.
You never call these functions directly, but `Batman.Model` depends on them to save, load and destroy data.

Batman.js ships with a few storage adapters you can use right away:

1. `Batman.LocalStorage` for storing data in [local storage][], if available.
2. `Batman.SessionStorage` for storing data in [session storage][], if available.
3. `Batman.RestStorage` for using RESTful HTTP (GET, POST, PUT, and DELETE) to store data in a backend app.
4. `Batman.RailsStorage` which extends `Batman.RestStorage` with some handy Rails-specific functionality like parsing out validation errors.

[local storage]: https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage#localStorage
[session storage]: https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage#sessionStorage

Use a storage adaper by passing to `@persist` in a model definition:

```coffeescript
class MyApp.Product extends Batman.Model
  @persist Batman.RestStorage
```

You can also extend any of the built-in storage adapters to:

- modify incoming and outgoing JSON
- include HTTP headers in requests

See the [`Batman.StorageAdapter` API docs](/docs/api/batman.storageadapter.html) for more info.