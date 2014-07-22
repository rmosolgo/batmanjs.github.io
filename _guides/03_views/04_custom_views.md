# Custom Views

Views are useful for creating reusable, configurable UI components. They are defined by extending `Batman.View` and they are used by adding `data-view` bindings inside HTML templates.

When you define a custom view, you can provide:

- [accessors](#accessors) which can be bound inside that view's bindings
- [functions](#event-handlers) which can handle events on that view
- [HTML](#providing-html-to-custom-views) to render inside the view's node

Besides defining custom views, you can also define [default views for controller actions](/docs/views.html#rendering-by-controller-actions).

## Defining Custom Views

To define a custom view, extend [`Batman.View`](/docs/api/batman.view.html). (You can also extend any subclass of `Batman.View`, such as another custom view.)

For example, here's a custom view that uses [jQueryUI Autocomplete](http://jqueryui.com/autocomplete/):

```coffeescript
class App.AutocompleteView extends Batman.View
  html: "<input id='autocomplete' type='text' />"

  @accessor 'autocompleteSource', -> []

  viewDidAppear: ->
    # @node is the container for the view
    input = $(@node).find("#autocomplete")
    $(input).autocomplete
      source: @get('autocompleteSource')
```

Obviously this isn't much use by itself, but we can extend it and provide more useful `autocompleteSource`s:

```coffeescript
class App.VillainAutocompleteView extends App.AutocompleteView
  @accessor 'autocompleteSource', -> App.Villian.get('all').mapToProperty('name')
```

Now, when we instantiate `App.VillianAutocompleteView`, it will have more interesting options!

## Accessors

When you define an `@accessor` on a custom view, it's also available to bindings. These accessors are a good place for complex view logic. For example, `postIsLong` could help you display a warning to the reader:

```coffeescript
class MyApp.PostsShowView extends Batman.View
  @accessor 'postIsLong', ->
    @controller.get('post.body').length > 5000
```

`postIsLong` is now available in the HTML template:

```html
<div data-showif='postIsLong'>
  <p> Warning! This is a long post. </p>
</div>
```

You can also pass in "options" to views. This allows you to explicitly pass objects into the view. For example, this view takes a `item` option from a `data-view-item` binding:

```coffeescript
class MyApp.ListItemView extends Batman.View
  @option 'item' 
  @accessor 'itemDescription', ->
    item = @get('item')
    "#{item.get('name'}, circa #{item.get('year')}"
```

```html
<ul>
  <li data-foreach-item='items' data-view='ListItemView' data-view-item='item'>
    <p data-bind='itemDescription'></p>
  </li>
</ul>
```

(See [`View.option` docs](/docs/api/batman.view.html#class_function_option) for more about view options.)

## Event Handlers

Functions defined in views are available as event handlers. You can bind them to events with `data-event` bindings. For example, `deleteItem` can be used in a `data-event-click` binding:

```coffeescript
class MyApp.ListItemView extends Batman.View
  deleteItem: (item) ->
    item.destroy (err, record) ->
      throw err if err?
```

```html
<button data-event-click='deleteItem | withArguments item'>Delete!</button>
```

## Providing HTML for Custom Views

Your custom views can get HTML in three ways:

- wrap existing HTML
- define an HTML string
- define a _source path_ that points to an HTML temlate.

To _wrap existing HTML_, simply add a `data-view` binding to a node with HTML inside it:

```html
<div data-view='CustomListView'>
  <ul>
    <li data-foreach-item='items' data-bind='item.name'></li>
  </ul>
</div>
```

This will instantiate a new `CustomListView` with the `<div>` as its [`node`](/docs/api/batman.view.html#prototype_accessor_node). All the HTML inside the `CustomListView` will stay where it is.

To _define an HTML string_, set the [`html` attribute](/docs/api/batman.view.html#prototype_accessor_html) in your view class:

```coffeescript
class App.SearchView extends Batman.View
  html: "<input type='text' id='search' placeholder='Enter a Search Term' />"
```

The HTML you specify will be rendered inside a node with a `data-view="SearchView"` binding.

To _define a source path_,  set the [`source` attribute](/docs/api/batman.view.html#prototype_accessor_source) in your view class:

```coffeescript
class App.HeaderNavigationView extends Batman.View
  source: 'layouts/_header_navigation'
  # will lookup template layouts/_header_navigation.html
```

Your app will try to load a file relative to [`Batman.config.pathToHTML`](/docs/configuration.html) to use as this view's HTML. You don't need to add `.html` to the `source` string.