# Routing

Routes bind URLs to [controller actions](/docs/controllers.html#controller-actions).

Routes are declared in your app definition. You can declare [single routes](#single-routes) with `@route` or declare [resource routes](#resource-routing) with `@resources` (inspired by [Rails routing](http://guides.rubyonrails.org/routing.html#resource-routing-the-rails-default)).

In your HTML, you can access routes [by name](#named-routes) with `data-route` bindings. In application code, you can [redirect with `Batman.redirect`](#redirecting).

Batman.js also provides access to [route params](#route-params).

## Single Routes

The simplest routing definition is `@route`:

```coffeescript
class MyApp extends Batman.App
         # path     , controller action
  @route "/products", 'products#index'
```

Now, visiting `"/products"` will dispatch the `products#index` action.

There is also a shortcut to define a route for `"/"`, `@root`:

```coffeescript
class MyApp extends Batman.App
  @root 'products#index'
```

Now, visiting `"/"` will dispatch the `products#index` action.

## Resource Routing

`@resources` creates several routes at once. Usually, these routes are for displaying one of your models. For example,

```coffeescript
class MyApp extends Batman.App
  @resources "posts"
```

creates the following mapping between URLs and actions on `MyApp.PostsController`:

Path | Controller Action | Named Route
-- | -- | --
`/posts` | App.PostsController#index | `routes.posts`
`/posts/new` | App.PostsController#new | `routes.posts.new`
`/posts/:id` | App.PostsController#show | `routes.posts[post]`
`/posts/:id/edit` | App.PostsController#edit | `routes.posts[post].edit`

These routes are also [accessible by name](#named-routes) in `data-route` bindings.

### Nested Routes

`@resources` takes a callback where you can define nested routes. There are three ways to define nested routes:

- `@member` defines a new route on top of the `show` route
- `@collection` defines a new route on top the `index` route
- `@resources` defines a new resource routes on top of the `show` route.

For example:

```coffeescript
class MyApp extends Batman.App
  @resources "users", ->
    @member "profile"
    @collection "search"
    @resources "photos"
```

`@member "profile"` maps `/users/:id/profile` to the `users#index` action.

`@collection "search"` maps `/users/search` to the `users#search` action.

`@resources "photos"` creates the following routes:

Path | Controller Action | Named Route
-- | -- | --
`/users/:userId/photos` | App.PhotosController#index | `routes.users[user].photos`
`/users/:userId/photos/new` | App.PhotosController#new | `routes.users[user].photos.new`
`/users/:userId/photos/:id` | App.PhotosController#show | `routes.users[user].photos[photo]`
`/users/:userId/photos/:id/edit` | App.PhotosController#edit | `routes.users[user].photos[photo].edit`

## Named Routes

You can create links inside your app with `data-route` bindings. The keypath passed to `data-route` is also called a _route query_ since it looks up routes by name.

Route queries always begin with `routes`. Then, you add segments to look up the route you want. For example, to link to `products#index`:

```html
<a data-route='routes.products'>All Products</a>
```

You can add query string parameters to the route with a `data-route-params` binding. For example:

```html
<a data-route='routes.products' data-route-params="'sale=true'">Sale Products</a>
```

Some route queries accept `Batman.Model` instances as segments. You can pass those with `[ ... ]`. For example, to link to a product's `edit` page:

```html
<a data-route='routes.products[product].edit'>
  Edit
  <span data-bind='product.name'></span>
</a>
```

When you use `@resources`, routes are named for you. You can also provide names for single routes by passing the `as` option. For example, to name this route `"special_offers"`:

```coffeescript
class MyApp extends Batman.App
  @route '/specials', 'products#specials', as: 'special_offers'
```

Then, you could bind to it in your tempate:

```html
<a data-route='routes.special_offers'>Daily Specials</a>
```

## Route Params

You can access current params with:

```coffeescript
MyApp.get('currentParams')
```

This `Batman.Hash` contains:

- _named params_ from the current route (eg, `id` from `/products/:id/edit`)
- _query string params_, such as `key` from `?key=value`

You can even use `currentParams` in view bindings. For example, you can add "active" state to navigation elements:

```html
<ul class='nav'>
  <li data-addclass-active='currentParams.controller | equals "products"'>
    <a data-route='routes.products'>Products</a>
  </li>
  <li data-addclass-active='currentParams.controller | equals "orders"'>
    <a data-route='routes.orders'>Orders</a>
  </li>
</ul>
```


You can also use `currentParams.url` to change the URL without reloading the page. This way you can influence data on the page and allow your users to get the same data on hard refreshes. Here's an example:

```coffeescript
Batman.currentApp.get('currentParams.url').update(page: 5)
```

It will even update the URL match a defined route if found:

```coffeescript
MyApp.get('currentParams.url').update(action: show, id: 6)  # /items/6
MyApp.get('currentParams.url').update(page: 5)              # /items/page/5
```

[Controller actions](/docs/controllers.html#controller-actions) are also called with a `params` argument. This argument is a plain JavaScript object which contains named params, `controller`, `action` and `target` (which refers to the controller instance).

## Redirecting

In application code, you can navigate to a route with `Batman.redirect` (or `@redirect` in a controller action). There are three ways to redirect:

- You can redirect to a __literal path__ by passing it to `Batman.redirect`:

  ```coffeescript
Batman.redirect("/posts/new")
```

  If `Batman.config.pathToApp` is present, it will be added to the path.

- You can pass a `Batman.Model` class or instance. Batman.js will create a resourceful route for the given object. For example:

  ```coffeescript
  Batman.redirect(MyApp.Post) # => will redirect to posts#index
  Batman.redirect(somePost)   # => will redirect to posts#show
```

- You can also use __redirect params__ to navigate to a controller action. Batman.js will build a route from the provided parameters. For example:

  ```coffeescript
  Batman.redirect(controller: "posts", action: "edit", id: 6)
  ```

See API documentation for [`Batman.redirect`](/docs/api/batman.html#class_function_redirect) for more information.

