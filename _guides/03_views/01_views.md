# View Basics

`Batman.View`s connect a batman.js application to a user by:

- rendering HTML templates
- maintaining [view bindings](/docs/bindings.html), which bind application objects to the DOM.

Views can be rendered in two ways:

1. __Controller actions render views into yields.__ Yields are defined in the layout view with `data-yield` bindings . Content for yields (other than `"main"`) is provided with `data-contentfor` bindings. This is analagous to the [Rails yield pattern](http://guides.rubyonrails.org/layouts_and_rendering.html#understanding-yield).
1. __Views render other views with `data-view` bindings.__ Custom views are a great choice for encapsulating UI and display components.

## Rendering by Controller Actions

Batman.js handles URLs by dispatching [controller actions](/docs/controllers.html#controller-actions), which render views. See the ["Rendering Views" in the Controller guide](/docs/controllers.html#rendering-views) for more information about how controller actions render views.

To customize a default view, simply define a class with the expected default name: 

Controller Name | Action | View Name
--- | --- | ---
App.PostsController | show | App.PostsShowView
App.PostsController | new | App.PostsNewView
App.PostsController | index| App.PostsIndexView
App.PostsController | edit | App.PostsEditView

For example, this view is automatically rendered by the `products#index` action:

```coffeescript
class App.ProductsIndexView extends Batman.View
  # source is "products/index" by default
```

The [Custom Views guide](/docs/custom_views.html) describes all the resources available when defining views.

## Rendering with "data-view" Bindings

Views can be _inserted into other views_ by using `data-view`. This allows you to simplify your HTML and view classes by extracting markup and logic in to reusable custom views.

To use a custom view, pass its name (relative to the app namespace, eg, `MyApp`) to `data-view`. For example:

```html
<div data-view='ProductListItemView'>
  <!-- batman.js will instantiate App.ProductListItemView with this node -->
</div>
```

If the custom view has its own HTML, that HTML will replace the contents of the `data-view` node.

## View Lifecycle

As a view is rendered, it fires several lifecycle events. Some events "bubble up" from subviews, so these events may be fired more than once.

One useful event is `viewDidAppear`, which is called after the view has been added to the DOM. You can initialize your view on `viewDidAppear` by defining a function with that name:

```coffeescript
class MyApp.CustomView extends Batman.View
  viewDidAppear: ->
    if !initialized
      initialized = true
      $(@node).find('.date-input').datepicker()
      @_otherInitialization()
```

See the [`Batman.View` lifecycle API docs](/docs/api/batman.view_lifecycle.html) for more information on those events and how to use them.

## View Hierarchy

Batman.js stores all active views in a _tree_, with the [`layout` view](/docs/api/batman.app.html#class_property_layout) as its root. Every view has one [`superview`](/docs/api/batman.view.html#prototype_property_superview) and any number of [`subviews`](/docs/api/batman.view.html#prototype_property_subviews). Batman.js manages the view tree internally, so a developer rarely interacts with it directly.

The view tree serves as a rendering context for [view bindings](/docs/bindings.html), which climb the tree to evaluate keypaths with [`Batman.View::lookupKeypath`](/docs/api/batman.view.html#prototype_function_lookupkeypath).

## Debugging

Batman.js exports the global `$context` function for debugging views. `$context` takes a DOM node and returns the batman.js view for that node. For example:

```javascript
allItems = $('#all_items')[0]
view = $context(allItems)
view # => App.ItemsIndexView instance
```

In Chrome, right-click -> "inspect element", assigns the node to `$0`. Then you can inspect the view with `$context($0)`.

When you have the view, you can inspect its superview and lookup keypaths in its context:

```javascript
view.get('superview')       # => Layout view
view.lookupKeypath('items') # => Batman.Set
```

