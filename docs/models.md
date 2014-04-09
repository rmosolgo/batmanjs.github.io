---
layout: docs
title: Models
prev_section: controllers
next_section: bindings
---

`Batman.Model` is responsible for representing data in your application and
providing a fluid interface for communicating with your backend app.

_Note_: This documentation uses the term _model_ to refer to the class `Model`
or a `Model` subclass, and the term _record_ to refer to one instance of a
model.

## Defining a Model

Models are defined by creating subclasses of `Batman.Model`. All the features described below will be inherited by
subclasses, so you can extend your own models, too.

- _Everything from [`Batman.Object`](/docs/api/batman.object.html):_ [accessors](/docs/api/batman.object_accessors.html), [events](/docs/api/batman.eventemitter.html), and [observers](/docs/api/batman.observable.html)
- _Persistence_ with encoders and storage adapters
- _Validations_ for standardizing data
- _Associations_ for linking records together.

Since `Batman.Model`s are also `Batman.Object`s, expect to use [`@accessor`](/docs/api/batman.object_accessors.html) to define many of your model attributes.

## Persistence

Persistence responsibilities are divided between:

- `Batman.Model` encoders, which define serialization of model attributes
- Storage adapters, which perform storage operations with serialized data.

### Encoders

Persisted model attributes are defined with _encoders_. These are directives that tell
batman.js to load certain keys and parse them in a certain way.

To simply encode and decode an attribute from JSON, pass one or more attribute names to `@encode`:

{% highlight coffeescript %}
class MyApp.Product extends Batman.Model
  @encode 'title', 'description', 'price'

class MyApp.Subscription extends MyApp.Product
  # Subscription inherits all encoders from MyApp.Product
  @encode 'period'
{% endhighlight %}

You can also define functions for encoding and decoding values by passing functions along with the attribute name(s):

{% highlight coffeescript %}
class MyApp.Product extends Batman.Model
  @encode 'price',
    encode: (value, key, outgoingJSON, record) ->
      # adds values from `record` to `outgoingJSON`
    decode: (value, key, incomingJSON, outgoingAttributes, record) ->
      # takes values from `incomingJSON` and adds them to `outgoingAttributes`,
      # so they can be mixed into the record
{% endhighlight %}

See the [`Model.encode` API docs](/docs/api/batman.model.html#class_function_encode) for more information about custom encoders.

Also, model associations (`@belongsTo`, `@hasMany`, etc) define their own encoders.

### Storage Adapters

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

{% highlight coffeescript %}
class MyApp.Product extends Batman.Model
  @persist Batman.RestStorage
{% endhighlight %}

You can also extend any of the built-in storage adapters to:

- modify incoming and outgoing JSON
- include HTTP headers in requests

See the [`Batman.StorageAdapter` API docs](/docs/api/batman.storageadapter.html) for more info.

## Validations

You can define validations for you models with `@validate`. Remember, client-side validation should _always_ be mirrored by server-side validation.

Here are a few example validations:

{% highlight coffeescript %}
class MyApp.Product extends Batman.Model
  @validate 'price', numeric: true, presence: true
  @validate 'owner_email', email: true
  @validate 'itemsRemaining', greaterThan: 0, unless: "isDiscontinued"
{% endhighlight %}

See the [`Model.validate` docs](/docs/api/batman.model.html#class_function_validate) for a full list of included validation options.

You can also define [custom validator classes](/docs/api/batman.validator.html).

## Associations

Model associations define relationships between models.

### Defining Associations

Associations are defined inside the model definition using `@belongsTo`, `@hasMany`, and `@hasOne`. Each association function takes:

- A label (string), which is used for the accessor name & encoder name
- An options object, for configuring the association.

For example, a deck of playing cards might be modeled like this:

{% highlight coffeescript %}
class MyApp.Deck extends Batman.Model
  @resourceName: 'deck'
  @encode 'brand'
  @hasMany 'cards', inverseOf: 'deck' # will look for `deck_id` on cards

class MyApp.Card extends Batman.Model
  @resourceName: 'card'
  @encode 'suit', 'rank', 'deck_id'
  @belongsTo 'deck', inverseOf: 'cards' # will match its `deck_id` to a deck's `id`

  @accessor 'fullName', -> "#{@get('rank')} of #{@get('suit')}"
  @delegate 'brand', to: 'deck'
{% endhighlight %}

Now, you can access the cards from their `Deck`:

{% highlight coffeescript %}
deck.get('cards')        # => Batman.AssocationSet containing `Card`s
deck.get('cards.length') # => 52
deck.get('cards').mapToProperty('fullName')
# => ["Ace of Spades", "Queen of Hearts", ...]
{% endhighlight %}

Similarly, you can access a `Deck` from a `Card`:

{% highlight coffeescript %}
aceOfSpades.get('deck')         # => a Deck instance (actually a BelongsToProxy)
aceOfSpades.get('deck.brand')   # => "Bicycle"
aceOfSpades.get('brand')        # => "Bicycle"
{% endhighlight %}

Associations are very configurable: see the [Model Associations API docs](/docs/api/batman.model_associations.html) have more detail about association options.

### Asynchronicity and Association Values

In fact, association accessors return special objects:

- `@hasMany` returns a `Batman.AssociationSet`. It is a `Batman.Set` tracking the [model's `loaded` set](/docs/api/batman.model.html#class_function_loaded) for foreign key matches.
- `@belongsTo` returns a `Batman.BelongsToProxy`. All properties are delegated associated record. The original record is available at the proxy's `"target"` accessor.

Using these special objects allows batman.js to account for asynchronous loading. For example, a `Batman.AssociationSet` may be rendered in a `Batman.View` even before its records are loaded. When the records are loaded, the view will be updated automatically. `Batman.BelongsToProxy` provides the same functionality.

To avoid asynchronous loading, use the `saveInline` option on your association.

## The Identity Map

batman.js uses an identity map for fetching and storing records, which is
essentially an in-memory cache of model instances. If you use `Model.find`
twice to fetch a record with the same ID, you'll get back the same (`===`)
instance both times, which means a backend record is only ever represented by a
single client-side record. This is useful for ensuring any state the instance
might have is preserved for every piece of code asking for it, and bindings to
the instance are kept synchronized when any piece of code updates the model.

Practically, the identity map is an implementation detail on the framework's
side that developers shouldn't need to interact with directly, but knowing you
have "one true instance" is helpful when reasoning about an application.

