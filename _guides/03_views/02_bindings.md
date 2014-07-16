# View Bindings

Batman.js bindings connect an app to the DOM. Bindings are created by adding `data-` attributes to your HTML templates:

```html
<!-- html/posts/show.html -->
<h1 data-bind='post.title'></h1>
<p data-bind='post.body'></p>
```

When `posts#show` is rendered with a post, the HTML will be bound to that post.

See the [`Batman.View Bindings` API documentation](/docs/api/batman.view_bindings.html) for a full list of available bindings and information about defining custom bindings.


## Binding Synchronization 

Bindings are automatically updated by batman.js. They observe their DOM node _and_ their `Batman.Object`s for changes, maintaining synchronization between the two. For example, in a `data-foreach` binding, the DOM will be automatically updated when an item is added to the collection:

```html
<ul>
  <li data-foreach-comment='post.comments'>
    <span data-bind='comment.body'></span>
  </li>
</ul>
```

When a new comment is created, its `<li>` will be added to the `<ul>`. When a comment is removed, its `<li>` will be removed.

Nodes can have multiple bindings:

```html
<p data-bind="body" data-showif="isPublished"></p>
```

or attribute bindings:

```html
<p data-bind-id="currentID"></p>
```

and bindings can be on inputs which the user can change:

```html
<input type="text" data-bind="title"></input>
```

When a bound input is updated by a user, the change is immediately propagated through the application.

## Keypaths & Context

To put data into view bindings, you pass _keypaths_ which point to values in the _render context_. This lookup is implemented by [`Batman.View::lookupKeypath`](http://batmanjs.org/docs/api/batman.view.html#prototype_function_lookupkeypath).

### Keypaths

A __keypath__ is a reference to a value in the current render context. Keypaths can have multiple segments:

```html
<p data-bind="order.customer.name"></p>
```

The keypath above is `order.customer.name`. It has three segments:

- `order`
- `customer`
- `name`

The binding will automatically update the HTML value when _any_ of those segments change. In the above example, this means the `<p>` tag's `innerHTML` will be updated when:

- the order changes,
- the order's customer changes, or
- the order's customer's name changes

You can rely on a binding to "just work" when its segments change. If any of the segments are assigned to new values, the binding will be immediately updated with the new value.

### Render Context

A binding can access properties on any of the objects in its render context. Its render context includes the objects "above" the binding in the view tree:

- the current `Batman.View` instance (which rendered the binding)
- the chain of views above the current view (called "superviews")
- the layout view (generated when a `Batman.App` is run)
- the current controller
- the current application
- the global scope (ie, `window`)

A binding will bind itself to the first object which returns a non-`undefined` value for its keypath.

### Keypath Literals

You may pass "keypath literals" as view binding arguments. Numbers, strings, and booleans can be passed as arguments to filters or used as the actual value of the keypath:

```html

<!-- Literals as values: -->
<p data-bind="'Hardcoded'"></p>
<p data-showif="true"></p>

<!-- Literals as arguments: -->
<p data-bind="body | append ' ... '"></p>
<p data-showif="shouldShow | default true"></p>
<p data-bind="body | truncate 100"></p>
<p data-bind="'Sir %{name}, the honourable' | interpolate {'name' : 'knight.name'}"></p>
```

## Iteration

A `data-foreach` binding creates a collection of HTML elements that are bound to a `Batman.Enumerable` (eg, `Batman.Set` or `Batman.Hash`). This binding takes two arguments: one in the attribute name and the other in the attribute value: `data-foreach-#{itemName}="#{collectionName}"`. For example, if you wanted to list the playing cards in a deck of cards:

```html
<ul>
  <li data-foreach-card='deck.cards'>
    <span data-bind='card.suit'></span>
    <span data-bind='card.number'></span>
  </li>
</ul>
```

Since batman.js keeps bindings in sync, you don't have to re-render these bindings. Under the hood, batman.js is observing the `Batman.Enumerable`'s  `itemsWereAdded` and `itemsWereRemoved` events. When one of these events is fired, batman.js adds or removes nodes from the DOM according to the items added or removed from the collection.

## Debugging

Developer versions of batman.js ship with a `data-debug` binding that calls `debugger` during the rendering process. At that point, `this` refers to the binding itself. You can access its view, then test keypath values with `lookupKeypath`:

```javascript
// debugger
this                                          // => <Binding>
this.view.lookupKeypath("deck.cards.length")  // => 52
```

There's also a global function called `$context` which accepts a DOM node and returns the `Batman.View` that the node is rendered inside. For example:

```javascript
allCards = document.getElementById("all-cards")
view = $context(allCards)         // => <App.CardsIndexView>
view.lookupKeypath("cards.first") // => <App.Card>
```
