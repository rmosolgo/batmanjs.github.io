# Model Basics

`Batman.Model` represents data in your application and
provides an interface for communicating with your storage (eg, JSON API).

_Note_: In batman.js, the term _model_ refers to the model class and the term _record_ refers to one instance of a model.

## Defining a Model

Models are defined by extending  `Batman.Model`. All the features described below will be inherited by subclasses, so you can extend your own models too. 

In fact, you may want to define a base model class for your application:

```coffeescript 
class MyApp.Model extends Batman.Model
```

Then extend the base class for your models:

```coffeescript
class MyApp.Post extends MyApp.Model 
  resourceName: 'post'
  @persist Batman.RestStorage
  @encode 'title', 'content'

  @accessor 'minutesRequired', -> 
    words = @get('content').split(" ").length
    Math.round(words / 200)
```

In your model definitions, you can declare:

- [_Everything from `Batman.Object`_](/docs/batman_object.html): accessors, observers, and events
- [_Persistence_](/docs/persistence.html) with encoders and storage adapters
- [_Validations_](/docs/validations.html) for standardizing data
- [_Associations_](/docs/model_associations.html) for linking records together

Since `Batman.Model`s are also `Batman.Object`s, expect to use [`@accessor`](/docs/batman_object.html#-accessor) to define many of your model attributes.

## Creating Records

There are two ways to create new records. You can use the __constructor__, which sets values according to any accessors you define. For example: 

```coffeescript
post = new MyApp.Post(title: "It's a wonderful day.")
post.get('title') # => "It's a wonderful day"
```

This is a common way to create records.

You can also use `Model.createFromJSON`.  `createFromJSON` differs in two ways:

- It uses any defined [encoders](/docs/persistence.html#encoders) when creating the record.
- If you pass a primary key to `createFromJSON` _and_ a matching record is already loaded in memory, the matching record will be updated and returned. 

Using `createFromJSON` won't duplicate records with the same primary key. For example, let's load a `Post` into memory:

```coffeescript
MyApp.Post.find 1, (err, post) ->
  post.get('title') # => "It's a miserable day"
```

Then use `createFromJSON` to update it (since we know it's already in memory)

```coffeescript
  updatedPost = MyApp.Post.createFromJSON(id: 1, title: "It's a great day")
```

`createFromJSON` returns the _same instance_ of `Post`:

```coffeescript
post is updatedPost # => true
```

and that instance has been updated:

```coffeescript
post.get('title') # => "It's a great day"
```

The model's constructor function is often the right choice for creating records, but `createFromJSON` (and its counterpart, `createMultipleFromJSON`) can be helpful when loading data from JSON.

## Loading Records

When your model has a [storage adapter](/docs/persistence.html#storage-adapters), you can load records from storage. `Model.load` loads _all_ records from storage: 

```coffeescript
MyApp.Post.load (err, records) -> 
    # `err` is any error that may have occured, or `null`
    # `records` is an array of records
```

`Model.load` also accepts options. You can use these options to filter the records that are loaded. For example:

```coffeescript
MyApp.Post.load {user_id: 5}, (err, record) ->
```

The option `user_id: 5` will be passed to the [storage adapter](/docs/persistence#storage-adapters). Then, you can implement the filtering on your backend (eg, JSON API).

You can find a __single record__ by primary key with `Model.find`: 

```coffeescript
MyApp.Post.find 1, (err, record) -> 
```

Any records that are _already loaded in memory_ can be found in the model's __loaded set__. `Model.get("loaded")` returns a `Batman.Set` containing all loaded instances of that model. For example:

```coffeescript
MyApp.Post.get('loaded') # => returns a Batman.Set containing records
```

`Model.get("all")` combines the techniques shown above. When you access `Model.all`, you will:

- Trigger a `Model.load` if this is the _first time_ `"all"` has been accessed
- Return the loaded set.

`Model.all` is great for view bindings because it will trigger a load, then, when the records are loaded, the view will be updated. For example:

```html
<ul>
  <li data-foreach-post='Post.all' data-bind='post.title'></li>
</ul>
```

You can clear the loaded set with `Model.clear()`.

## Saving Records 

When your model has a [storage adapter](/docs/persistence.html#storage-adapters), you can save records in storage.

You can save any record by calling `save`.  When you call `save`, the record will also be [validated](/docs/validations.html). For example:

```coffeescript
post = new MyApp.Post(title: "What I've Been Thinking about Lately")
post.save (err, record) ->
```

In this callback, `err` may be:

- A `Batman.ErrorsSet`, if there were any validation errors
- A `Batman.StorageAdapter` error, if there was an error in the storage operation
- `null`, if there was no error. 

If `err` isn't null, that means that the save was not completed. You should write handlers that allow the user to fix any validation errors that occured!

## Destroying Records

When your model has a [storage adapter](/docs/persistence.html#storage-adapters), you can destroy records in storage.

If a record has been saved, you can destroy it by calling `destroy`. For example:

```coffeescript
post.destroy (err, record) ->
  # `err` is a storage error, if there was one (eg, UnauthorizedError)
  # `record` is the now-destroyed record
```

You can't destroy records that haven't been saved yet. To check if a record has been saved, use `record.get("isNew")`.

## Naming Conventions in Batman.Model

- `id` magic accessor
- resourceName as singularized, underscored model name
- {resourceName}_id as foreign keys


## Loaded Records & Object Identity

Batman.js assumes that records with the same primary key will _always_ be the same object. This means that even if you call `Model.find` twice, you'll get the same instance:

```coffeescript
Post.find 1, (err, firstPost) ->
  Post.find 1, (err, secondPost) ->
    # firstPost and secondPost are references to the same object
    firstPost === secondPost # => true 
```

You can also test the identity of `Batman.Object`s by accessing `_batmanID`: 

```coffeescript
firstPost.get("_batmanID") is secondPost.get("_batmanID") # => true
```

This way, you'll know you always have the "one true instance" of a record. 

These "true instances" are kept in a model's __loaded set__, which is a `Batman.Set` accessible as `Model.loaded`:

```coffeescript
MyApp.Post.get('loaded') # => <# Batman.Set #>
```

This `Batman.Set` is sometimes called the _identity map_, since it's used by batman.js to map JSON records to in-memory objects. The identity map is an implementation detail of batman.js, but it may still be helpful to understand it when reasoning about your application.


