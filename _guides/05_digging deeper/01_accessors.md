# Accessors in Depth

Accessors are much like methods or instance variables on `Batman.Object`s. In a batman.js app, accessors can be defined on app components:

- On controllers and views, accessors can be bound by view bindings.
- On models, accessors can be used as model properties.
- On the app, class accessors (defined with `@classAccessor`) are accessible in view bindings and from `MyApp`.

Internally, batman.js uses accessors to implement a lot of APIs, including:

- route queries
- controller lookup
- storage of model attributes 
- data structures like `Batman.Set` and `Batman.Hash`

Understanding accessors will empower you to write more powerful & expressive batman.js code!

This guide will cover:

- [Defining accessors on classes, prototypes and instances](#accessors-on-classes-prototypes-and-instances)
- [Default accessors and how to use them](#accessor-lookup-default-accessors)
- [Modifying accessors with `@wrapAccessor`](#wrapping-accessors)
- [Accessors with arguments](#accessors-with-arguments)
- [Asynchronous accessors](#asynchronous-accessors)
- [Accessor value caching](#caching)

## Accessors on Classes, Prototypes and Instances 

Any `Batman.Object` can have accessors. This includes: 

- _CoffeeScript classes_ that extend `Batman.Object`
- _prototypes of classes_ that extend `Batman.Object`
- _instances of classes_ that extend `Batman.Object`

__Classes__ get accessors by `@classAccessor` in their definition. This is useful for a `Batman.App` object. Since it's never instantiated, you should make accessors on the _class_ rather than the prototype. For example: 

```coffeescript
class MyApp extends Batman.App 
  @classAccessor 'isCanvasSupported', ->
    elem = document.createElement('canvas')
    !!(elem.getContext and elem.getContext('2d'))
```

In a class definition, `@` refers to the class. So you can also define class accessors by calling `classAccessor` on the class itself:

```coffeescript
MyApp.classAccessor 'isAdmin', -> MyApp.User.get('current.isAdmin')
```

__Prototypes__ get accessors by `@accessor` in their class definition:

```coffeescript 
class MyApp.Artist extends Batman.Model 
  @accessor "isProlific", ->
    @get('works.length') > 20
```

This also defines accessor `isProlific` on all instances of `Artist`.

Since `@` refers to the class, you can also define prototype-level accessors by calling `accessor` on the class:

```coffeescript
MyApp.Artist.accessor 'hasHighlyValuedWorks', ->
  @get('works').some (work) -> work.get('price') > Math.pow(10, 6)
```

__Instances__ may also have accessors of their own by calling `accessor` on the instance. For example, to give `vanGogh` a `hasBothEars` accessor:

```coffeescript
vanGogh = new MyApp.Artist
vanGogh.accessor 'hasBothEars', -> 
    thisYear = (new Date).getYear() + 1900
    thisYear < 1889 # he cut his ear off in 1888
```

Other instances of `Artist` won't have this accessor.


## Accessor Lookup & Default Accessors

Consider a simple `get` call: 

```coffeescript
post.get('title')
```

When you call `get`, batman.js looks up an accessor whose name matches the argument you passed.  First, it looks for a _defined accessor_ by checking:

```
instance > prototype > superclass prototype chain
```

If it doesn't find a defined accessor, it uses the _default accessor_ for this object. Because it's invoked whenever a specific accessor is not found, a default accessor like `method_missing` or `doesNotUnderstand`.

You can define the default accessor for an object by calling its accessor function _without a label_. For example, to implement the default accessor of `Artist` to find a work with the provided name:

```coffeescript 
class MyApp.Artist extends Batman.Object
  @accessor 'name'
  @accessor (key) ->
    @get('works.indexedByUnique.name').get(key)
```

```coffeescript 
leonardoDaVinci.get("name")                   # uses "name" accessor
painting = leonardoDaVinci.get("Last Supper") # uses the default accessor
```

_In this example, `Artist` extended `Batman.Object`, not `Batman.Model`. This is because `Batman.Model` already has a default accessor which is used for storing model attributes!_

## Wrapping Accessors 

When you want to modify an existing accessor but not override it, you can use `@wrapAccessor`. For example, to extend the `name` accessor to upcase its value:

```coffeescript 
class MyApp.UpcasedArtist extends MyApp.Artist
  @wrapAccessor 'name', (core) ->
    get: (key) ->
        name = core.get.call(@, key)
        name?.toUpperCase()
```

The `@wrapAccessor` callback is invoked with `core`, which is the accessor object for the existing accessor. It has `get` and `set` keys which you may use when defining your wrapper. You must call `core.get` or `core.set` if you want the original accessor function to be executed.

## Accessors with Arguments

When you need a source-tracked value computed from more than one object, an _accessor with arguments_ is a good option. To define an accessor that takes an argument, use `Batman.TerminalAccessible`. For example:

```coffeescript 
class MyApp.Gallery extends Batman.Model
  @accessor 'hasWorksByArtist', ->
    new Batman.TerminalAccessible (artist) => # fat arrow!
      artistsInGallery = @get('works').mapToProperty('artist')
      artist in artistsInGallery
``` 

Then, you can pass an argument to the accessor with `get`:

```coffeescript
isabellaStewartGardnerMuseum.get('hasWorksByArtist').get(rembrandt) # => true

# art theft! http://en.wikipedia.org/wiki/Isabella_Stewart_Gardner_Museum#Art_theft_of_1990
isabellaStewartGardnerMuseum.get('works').remove(stormOnTheSeaOfGalilee) 

isabellaStewartGardnerMuseum.get('hasWorksByArtist').get(rembrandt) # => false
```

Or in view bindings with `[...]`:

```html
<div data-showif='museum.hasWorksByArtist[artist]'>
  <h1 data-bind='artist.name'></h1>
</div>
```

## Asynchronous Accessors

You can define "promise accessors" in batman.js. If an accessor object has a promise key, it is a promise accessor. The promise function will be called with a deliver function as its only argument, which it must call with (err, value) when its operation is complete. For example:

```coffeescript
class MyApp.Painting extends Batman.Model
  # The estimated value API can be slow, let's fetch this value asynchronously
  @accessor 'estimatedValue', promise: (deliver) ->
    new Batman.Request
      url: "/#{@get('name')}/estimate"
      success: (data) ->
        deliver(null, data.estimate)
      error: (err) ->
        deliver(err, null)
    # no early return value:
    return undefined
```

The promise accessor will fetch a value, then update accessors that depend on it. If the `promise` function returns something other than `undefined`, it is treated as an early, synchronous return.

## Caching 

Batman.js caches the result of accessor functions and reuses the cached value until one of the accessor's dependencies changes. See ["Source Tracking" in the `Batman.Object` guide](/docs/batman_object.html#source-tracking) for more information about accessors and dependencies. 

You can force an accessor to recalculate _every time_ it is retrieved with `get` by passing `cache: false` to `@accessor`. For example:

```coffeescript 
  @accessor 'millisecondsSinceEpoch', 
    get: -> (new Date).getTime()
    cache: false
```

This accessor will be calculated every time you `get("millisecondsSinceEpoch")`. It _won't_ be a live-updating ticker because batman.js will `get` it when rendering the view, but then won't `get` it again.


