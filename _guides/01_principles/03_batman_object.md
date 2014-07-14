# Batman.Object

`Batman.Object` superclass of (almost) every object in batman.js. The more you understand `Batman.Object`, the more you'll benefit from batman.js. `Batman.Object` has a few things that make it special:

- [__Properties__](#properties) which _update themselves_ when their dependencies change 
- [__Observers__](#observers) which respond to changes in property values
- [__Events__](#events) which can be handled (and fired) by your application

Instances and classes of batman.js app components are all `Batman.Object`s, so these principles apply to all of them. If a class doesn't extend `Batman.Object`, it is noted in the API documentation (for example, `Batman.Navigator`).

## Properties 

Every `Batman.Object` has _properties_ which can be accessed with `get` and `set`:

```coffeescript
comment = new Batman.Object
comment.set("mood", "pensive")
comment.get("mood") # => "pensive"
```

Properties are _always_ accessed with `get` and `set`. Batman.js depends on `get` and `set` for mainaining bindings throughout your application.

### @accessor

By default, `get` and `set` simply access properties on a `Batman.Object`. However, you can use `@accessor` inside class definitions to provide custom getters and setters. These functions are called _accessors_.

Accessors are an integral part of batman.js. They power many of batman.js's features, such as [source tracking](#source-tracking) and [view bindings](/docs/bindings.html). You should use `@accessor` whenever possible.

For example, you could use this accessor to modify data when it is retrieved:

```coffeescript
class Comment extends Batman.Model
  @accessor 'mood',
    set: (key, value) -> @_mood = value
    get: (key)        -> 
      mood = (@_mood || "happy")
      mood.toUpperCase() + "!"
```

In this accessor, we've: 

- stored the value for `mood` in a private variable, `@_mood`
- provided `"happy"` if there was no previous value for `@_mood`
- modified the `mood` by uppercasing it and appending `"!"`

This accessor would behave like this:

```coffeescript 
comment = new Comment
comment.get('mood')         # => "HAPPY!"
comment.set('mood', 'sad')
comment.get('mood')         # => "SAD!"
```

Notice that `"sad"` was converted to `"SAD!"` by the `get` accessor.

There is also a __shorthand syntax__ for read-only accessors. Pass the `get` function to `@accessor`:

```coffeescript
class Comment extends Batman.Object 
  # ...  
  # getter function only
  @accessor 'isPositive', (key) -> 
    @get('mood') in ["HAPPY!", "JOVIAL!", "CONGENIAL!"]
```

Read-only accessors are very common in batman.js because they can be bound to views. They often replace instance methods.

### Keypaths

When you pass a string to `get` or `set`, you can access "deep" or "nested" properties of an object by joining property names with `.`. The string is like _path_ to the _key_ you want to access, so it's sometimes called a _keypath_.

For example, let's say your `user` had a `name`:

```coffeescript
user = new Batman.Object(name: "Bruce Wayne")
```

And it belonged to a `comment`:

```coffeescript
comment.set('user', user)
```

You could access the users's name from the comment with a keypath:

```coffeescript: 
comment.get('user.name') # => "Bruce Wayne"
```

Keypaths are also used in view bindings. For example:

```html
<ul>
  <li data-foreach-comment='post.comments'>
    <!-- deep access to comment.user.name -->
    <span data-bind='comment.user.name | append " said: "'></span>
    <span data-bind='comment.body'></span>
  </li>
</ul>
```

### Source Tracking 

Accessors participate in _source tracking_, which means that their values are automatically updated when their dependencies change. 

Consider this example:

```coffeescript
class Person extends Batman.Object 
  @accessor 'name', ->
    "#{@get('firstName')} #{@get('lastName')}"
```

Whenever a `Person`'s  `"firstName"` or `"lastName"` is updated with `set`, `"name"` will be updated. 

_Note: In fact, the property isn't reevaluated immediately. Its cache is busted and it will be reevaluated next time it's accessed with `get`._

Batman.js does this by evaluating `get` functions in a special context where nested `get` calls are tracked. When you `get` a value, batman.js tracks _which other properties_ were accessed to calculate the value Then, batman.js observes those other properties. When one of those properties changes, batman.js recaluculates the value for the accessor.

There are some caveats to batman.js's source tracking: 

- Asynchronous operations can't be tracked
- If you don't use `get` to access properties, their sources can't be tracked
- If you don't use `set` to update properties, their dependents can't be updated

## Observers

You can observe properties of `Batman.Object`s. Call `observe` with a keypath and a handler:

```coffeescript
post.observe 'upvotes', (newValue, oldValue) ->
  if newValue > 20
    @set('trending', true)
```

However, observers can lead to memory leaks if they aren't removed with `forget`.

Since `Batman.View` is also a `Batman.Object`, custom views may also have observers. Creating observers inside views has one huge benefit: batman.js takes care of removing all observers when the view is removed from the page. This greatly reduces the chance of memory leaks.

## Events

A `Batman.Object` may fire events with `fire(event, data)` and listen to events with `on(event, callback)`. Many of batman.js's app components fire events which you can use when building your app. 

