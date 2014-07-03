# Controllers

`Batman.Controller` is the C in MVC. Controllers have _actions_ which are are dispatched by the router.

Controllers are instantiated once (internally, by batman.js) and all controller actions are invoked on the same contoller instance while the app is running.

## Controller Actions

Controller actions are functions that:

- __prepare data to display__ by interacting with the app's models.
- __render views__, either implicitly or explicitly.

Controller actions may be bound _by name_ to URLs. The controller action name is determined by:

- Downcasing the first letter of the class name
- Removing "Controller" from the class name
- Appending "#"
- Appending the name of the action (ie, the function name).

For example, this controller action:

{% highlight coffeescript %}
class MyApp.ProductReviewsController extends Batman.Controller
  index: -> # ...
{% endhighlight %}

would have this name for routing:

{% highlight coffeescript %}
'productReviews#index'
{% endhighlight %}

## Routing

To bind controller actions to URLs, define _routes_ in your app definition. You can bind single routes with `@route` or define _resource routes_ with `@resources` (inspired by [Rails routing](http://guides.rubyonrails.org/routing.html#resource-routing-the-rails-default)).

The simplest routing definition is `@route`:

{% highlight coffeescript %}
class MyApp extends Batman.App
         # path     , controller action
  @route "/products", 'products#index'
{% endhighlight %}

There is also a shortcut to define a route for `"/"`, `@root`:

{% highlight coffeescript %}
class MyApp extends Batman.App
  @root 'products#index'
{% endhighlight %}

`@resources` creates several routes at once. For example,

{% highlight coffeescript %}
class MyApp extends Batman.App
  @resources "products"
{% endhighlight %}

Would create the following mapping between URLs and actions on `MyApp.ProductsController`:

<div class="mobile-side-scroller">

<table>
  <thead>
    <tr>
      <th> URL </th>
      <th> Controller Action </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td> <p><code>/products</code></p></td>
      <td> <p><code>products#index</code></p></td>
    </tr>
    <tr>
      <td> <p><code>/products/:id</code></p></td>
      <td> <p><code>products#show</code></p></td>
    </tr>
    <tr>
      <td> <p><code>/products/:id/edit</code></p></td>
      <td> <p><code>products#edit</code></p></td>
    </tr>
    <tr>
      <td> <p><code>/products/new</code></p></td>
      <td> <p><code>products#new</code></p></td>
    </tr>
  </tbody>
</table>
</div>

These routes are accessible in [`data-route` bindings](/docs/api/batman.view_bindings.html#data-route). For more on routing, see the [App Routing API docs](/docs/api/batman.app_routing.html)

## Preparing Data

Controllers prepare data for views by interacting with models and `set`ting them on themselves. Here are some common actions for preparing data:

{% highlight coffeescript %}
class MyApp.ProductsController extends MyApp.ApplicationController
  routingKey: 'products'
  new: ->
    @set 'product', new MyApp.Product

  show: (params) ->
    # mind the fat arrow
    MyApp.Product.find params.id, (err, record) =>
      @set 'product', record

  edit: (params) ->
    # mind the fat arrow
    MyApp.Product.find params.id, (err, record) =>
      @set 'product', record

  index: ->
    @set 'products', MyApp.Product.get('all')
{% endhighlight %}

These values will be accessible as `product` or `products` in [view bindings](/docs/bindings.html).

## Rendering Views

Controller actions can render views in two ways:

- _implicitly_, by allowing batman.js to infer the view and render it after the action body is executed
- _explicitly_, by calling `@render` in the controller action

### Implicit Rendering

If you don't call `@render` in your controller action, batman.js will render a view for you. It will look up a view class by:

- Camelizing the controller's `routingKey`
- Appending the camelized action name
- Appending `View`
- Looking it up on `Batman.currentApp` (the currently-running app)

For example,

{% highlight coffeescript %}
'products#index'
{% endhighlight %}

would render

{% highlight coffeescript %}
MyApp.ProductsIndexView
{% endhighlight %}

If a view with the expected name isn't found, batman.js uses a plain `Batman.View` instead.

In fact, this lookup is built into `@render`, so if you call `@render` without passing a `view` option, batman.js will look up a class this way.

### Explicit Rendering

Calling `@render` in a controller action gives you more control over how the view is rendered. If you don't provide a `view` options, batman.js will look up a default view as described in "Implicit Rendering".

By explicitly rendering, you can:

- __Render a non-default view__ by passing a `view` option to `@render`:
  {% highlight coffeescript %}
    new: ->
      @set 'product', new MyApp.Product
      # use the edit view for new products, too:
      @render(view: MyApp.ProductsEditView) {% endhighlight %}
- __Render into other yields__ by passing an `into` option to `@render`. `"main"` is the [default yield](/docs/api/batman.controller.html#prototype_property_defaultrenderyield), but you can render actions into other yields:
  {% highlight coffeescript %}
    edit: (params) ->
      MyApp.find params.id, (err, record) =>
        @set 'product', record
      @render(into: 'sidebar'){% endhighlight %}
- __Delay the render__ by calling `@render(false)`, then calling `@render` when you want to render a view:
  {% highlight coffeescript %}
    show: (params) ->
      MyApp.find params.id, (err, record) =>
        @set 'product', record
        @render()
      @render(false) # prevents implicit render {% endhighlight %}
