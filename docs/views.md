---
layout: docs
title: Views
prev_section: bindings
next_section: testing
---

`Batman.View`s connect a batman.js application to a user by:

- rendering HTML templates
- maintaining [view bindings](/docs/bindings.html), which bind application objects to the DOM.

Views can be rendered in two ways:

1. __Controller actions render views into yields.__ Yields are defined in the layout view with [`data-yield` bindings](/docs/api/batman.view_bindings.html#data-yield). Content for yields (other than `"main"`) is provided with [`data-contentfor` bindings](http://batmanjs.org/docs/api/batman.view_bindings.html#data-contentfor). This is analagous to the [Rails yield pattern](http://guides.rubyonrails.org/layouts_and_rendering.html#understanding-yield).
1. __Views render other views with [`data-view` bindings](/docs/api/batman.view_bindings.html#data-view).__ Custom views are a great choice for encapsulating UI and display components.

## Rendering by Controller Actions

Batman.js handles URLs by dispatching [controller actions](/docs/controllers.html), which render views. Controller actions may render views _explicitly_ or _implicitly_. See the [controller guide](/docs/controllers.html) for more information about how controller actions render views.

Everything in "Custom Views" below also applies default views which are rendered by controller actions. To customize a default view, simply define a class with the expected default name.

For example, this view is automatically rendered by the `products#index` action:

{% highlight coffeescript %}
class App.ProductsIndexView extends Batman.View
  # source is "products/index" by default

  # can be bound in HTML: `data-bind='myCustomAccessor'`
  @accessor 'myCustomAccessor' -> # ...

  # can be bound in HTML: `data-event-click="myClickHandler"`
  myClickHandler: -> # ...
{% endhighlight %}

## Rendering with "data-view" Bindings

Views can be _inserted into other views_ by using [`data-view` bindings](/docs/api/batman.view_bindings.html#data-view). This allows you to simplify your HTML and view classes by extracting markup and logic in to reusable custom views.

To use a custom view, pass its name (relative to the app namespace) to `data-view`. For example:

{% highlight html %}
<div data-view='ProductListItemView'>
  <!-- batman.js will instantiate App.ProductListItemView with this node -->
</div>
{% endhighlight %}

If the custom view has its own HTML, that HTML will replace the contents of the `data-view` node.

## Custom Views

Views are useful for creating reusable, configurable UI components. They are defined by extending [`Batman.View`](/docs/api/batman.view.html) and they are used by adding [`data-view` bindings](/docs/api/batman.view_bindings.html#data-view) inside HTML templates.

### Defining Custom Views

To define a custom view, extend [`Batman.View`](/docs/api/batman.view.html). (You can also extend any subclass of `Batman.View`, such as another custom view.)

For example, here's a custom view that uses [jQueryUI Autocomplete](http://jqueryui.com/autocomplete/):

{% highlight coffeescript %}
class App.AutocompleteView extends Batman.View
  html: "<input id='autocomplete' type='text' />"

  @accessor 'autocompleteSource', -> []

  viewDidAppear: ->
    # @node is the container for the view
    input = $(@node).find("#autocomplete")
    $(input).autocomplete
      source: @get('autocompleteSource')
{% endhighlight %}

Obviously this isn't much use by itself, but we can extend it and provide more useful `autocompleteSource`s:

{% highlight coffeescript %}
class App.VillainAutocompleteView extends App.AutocompleteView
  @accessor 'autocompleteSource', -> App.Villian.get('all').mapToProperty('name')
{% endhighlight %}

Now, when we instantiate `App.VillianAutocompleteView`, it will have more interesting options!

### Providing HTML for Custom Views

Your custom views can get HTML in three ways:

- wrap existing HTML
- define an HTML string
- define a _source path_ that points to an HTML temlate.

To _wrap existing HTML_, simply add a [`data-view` binding](/docs/api/batman.view_bindings.html#data-view) to a node with HTML inside it:

{% highlight html %}
<div data-view='CustomListView'>
  <ul>
    <li data-foreach-item='items' data-bind='item.name'></li>
  </ul>
</div>
{% endhighlight %}

This will instantiate a new `CustomListView` with the `<div>` as its [`node`](/docs/api/batman.view.html#prototype_accessor_node). All the HTML inside the `CustomListView` will stay where it is.

To _define an HTML string_, set the [`html` attribute](/docs/api/batman.view.html#prototype_accessor_html) in your view class:

{% highlight coffeescript %}
class App.SearchView extends Batman.View
  html: "<input type='text' id='search' placeholder='Enter a Search Term'></input>"
{% endhighlight %}

The HTML you specify will be rendered inside a node with a `data-view="SearchView"` binding.

To _define a source path_,  set the [`source` attribute](/docs/api/batman.view.html#prototype_accessor_source) in your view class:

{% highlight coffeescript %}
class App.HeaderNavigationView extends Batman.View
  source: 'layouts/_header_navigation'
  # will lookup template layouts/_header_navigation.html
{% endhighlight %}

Your app will try to load a file relative to [`Batman.config.pathToHTML`](/docs/configuration.html) to use as this view's HTML. You don't need to add `.html` to the `source` string.

### Accessors and Handlers

Accessors and functions inside a custom view are accessible by that [view's bindings](/docs/bindings.html). That allows you to slim down controllers and other views by moving things into a custom view.

Functions defined in custom views are available as event handlers. For example, `deleteItem` can be used in a `data-event-click` binding:

{% highlight coffeescript %}
class MyApp.ListItemView extends Batman.View
  deleteItem: (item) ->
    item.destroy (err, record) ->
      throw err if err?
{% endhighlight %}

{% highlight html %}
<button data-event-click='deleteItem | withArguments item'>Delete!</button>
{% endhighlight %}

Accessors are also available to bindings. `itemDescription` is available inside the view:

{% highlight coffeescript %}
class MyApp.ListItemView extends Batman.View
  @option 'item' # accepts value from data-view-item binding
  @accessor 'itemDescription', ->
    item = @lookupKeypath('item')
    "#{item.get('name'}, circa #{item.get('year')}"
{% endhighlight %}

{% highlight html %}
<ul>
  <li data-foreach-item='items' data-view='ListItemView' data-view-item='item'>
    <p data-bind='itemDescription'></p>
  </li>
</ul>
{% endhighlight %}

(See [`View.option` docs](/docs/api/batman.view.html#class_function_option) for more about view options.)

## View Lifecycle

As a view is rendered, it fires several lifecycle events. Some events "bubble up" from subviews, so these events may be fired more than once.

One useful event is `viewDidAppear`, which is called after the view has been added to the DOM. You can initialize your view on `viewDidAppear` by defining a function with that name:

{% highlight coffeescript %}
class MyApp.CustomView extends Batman.View
  viewDidAppear: ->
    if !initialized
      initialized = true
      $(@node).find('.date-input').datepicker()
      @_otherInitialization()
{% endhighlight %}

See the [`Batman.View` lifecycle API docs](/docs/api/batman.view_lifecycle.html) for more information on those events and how to use them.

## View Hierarchy

Batman.js stores all active views in a _tree_, with the [`layout` view](/docs/api/batman.app.html#class_property_layout) as its root. Every view has one [`superview`](/docs/api/batman.view.html#prototype_property_superview) and any number of [`subviews`](/docs/api/batman.view.html#prototype_property_subviews). Batman.js manages the view tree internally, so a developer rarely interacts with it directly.

The view tree serves as a rendering context for [view bindings](/docs/bindings.html), which climb the tree to evaluate keypaths with [`Batman.View::lookupKeypath`](/docs/api/batman.view.html#prototype_function_lookupkeypath).

## Debugging

Batman.js exports the global `$context` function for debugging views. `$context` takes a DOM node and returns the batman.js view for that node. For example:

{% highlight javascript %}
allItems = $('#all_items')[0]
view = $context(allItems)
view # => App.ItemsIndexView instance
{% endhighlight %}

In Chrome, right-click -> "inspect element", assigns the node to `$0`. Then you can inspect the view with `$context($0)`.

When you have the view, you can inspect its superview and lookup keypaths in its context:

{% highlight javascript %}
view.get('superview')       # => Layout view
view.lookupKeypath('items') # => Batman.Set
{% endhighlight %}

