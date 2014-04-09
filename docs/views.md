---
layout: docs
title: Views
prev_section: bindings
next_section: testing
---

`Batman.View` is the bridge between application state and user interaction.
Views are responsible for rendering templates, handling bindings, and general
manipulation of the DOM. Most of the time, they'll be automatically created by
bindings within templates, but they can be manually manipulated as well.


## The View Hierarchy

Views are organized as a rooted tree structure, similar to that of Cocoa. Each
view keeps track of its parent (`superview`) and its direct children
(`subviews`). The root of the tree is referred to as the *layout view*, which
is responsible for the document's `<html>` node. There is one layout view per
`App`.


### Views as data contexts

The view tree is also used to organize data in a hierarchical way, reminiscent
of variable scoping in JavaScript. Properties of a view are accessible to its
entire subtree, making it an ideal way to store data relevant to part of the
DOM.

Whenever you create a binding with `data-bind` or similar, the tree is
traversed to locate the specified keypath (via `[View::lookupKeypath]`). The
lookup follows this chain:

current view → chain of superviews → layout view → active controller → app →
window

[View::lookupKeypath]: /docs/api/12_Batman.View.html#something


### Adding views to the DOM

Views are added to the DOM by adding them to a superview that is already part
of the DOM. The layout view represents the root `<html>` node, so it is always
in the DOM.

When adding a subview, you need to specify where exactly in the superview's DOM
tree the subview should be appended. To do this, set the `parentNode` property
on the subview. This can either be a node contained in the superview's DOM tree
already or a string selector to find one.

Alternatively, you may set the `contentFor` property on a subview. This uses
batman.js' traditional `yield` system and will replace the yield node's content
with the subview's `node`. You should set `contentFor` to a string matching the
name of the `yield` in the subview.

## View Lifecycle

As a view is manipulated by the application, it progresses through various
states. As it does this, it fires events that you can hook into:

- `viewWillAppear`: Fired when the view is about to be attached to the DOM. It
  will always have a superview.
- `viewDidAppear`: Fired when the view has just been attached to the DOM. Its
  node is on the page, and could be selected with `document.querySelector`.
- `viewWillDisappear`: Fired when the view is about to be detached from the
  DOM. It will still have a superview set.
- `viewDidDisappear`: Fired when the view has just been detached from the DOM.
  Its node is no longer part of the page, and may not be selected from the
document. If it was removed directly it will not have a superview, and if an
ancestor was removed it will still have a superview.
- `viewDidMoveToSuperview`: Fired when the superview property is changed to a
  valid view, regardless of whether that superview is in the DOM or not.
- `viewWillRemoveFromSuperview`: Fired when the subview is going to be removed
  from its superview, regardless of whether that superview is in the DOM or
not.
- `viewDidLoad`: After `loadView` has been successfully called, the div has
  been created and populated with HTML from the `HTMLStore`.
- `ready`: All bindings have been initialized (one shot).

## Custom Views

Views are useful for creating reusable, configurable components which can be
instantiated from within templates.

### Defining Custom Views

A custom view is a subclass of [`Batman.View`](/docs/api/batman.view.html).
You can specialize your own custom views by subclassing them again.
For example, here's a custom view that uses [jQueryUI Autocomplete](http://jqueryui.com/autocomplete/):

{% highlight coffeescript %}
class App.AutocompleteView extends Batman.View
  html: "<input type='text' />"
  autocompleteSource: -> []
  viewDidAppear: ->
    input = @node.firstChild # @node is the container for the view
    $(input).autocomplete
      source: @autocompleteSource()
{% endhighlight %}

Obviously this isn't much use by itself, but we can extend it and provide more useful `autocompleteSource`s:

{% highlight coffeescript %}
class App.VillainAutocompleteView extends App.AutocompleteView
  autocompleteSource: -> App.Villian.get('all').mapToProperty('name')
{% endhighlight %}

Now, when we instantiate `App.VillianAutocompleteView`, it will have more interesting options!

### Providing HTML for Custom Views

Your custom views can get HTML in three ways: bind to existing HTML, pass an HTML string, or point it at an HTML file.

To _bind to existing HTML_, simply add a [`data-view` binding](/docs/api/batman.view_bindings.html#data-view) that points to the view you want to instiate:

{% highlight html %}
<div data-view='CustomListView'>
  <ul>
    <li data-foreach-item='items' data-bind='item.name'></li>
  </ul>
</div>
{% endhighlight %}

This will instantiate a new `CustomListView` with the `<div>` as its [`node`](/docs/api/batman.view.html#prototype_accessor_node). All the HTML inside the `CustomListView` will stay where it is.

To _pass an HTML string_, set the [`html` attribute](/docs/api/batman.view.html#prototype_accessor_html) in your view class:

{% highlight coffeescript %}
class App.SearchView extends Batman.View
  html: "<input type='text' id='search' placeholder='Enter a Search Temr'></input>"
{% endhighlight %}

The HTML you specify will be rendered inside a node with a `data-view="SearchView"` binding.

To _point to an HTML file_,  set the [`source` attribute](/docs/api/batman.view.html#prototype_accessor_source) in your view class:

{% highlight coffeescript %}
class App.HeaderNavigationView extends Batman.View
  source: 'layouts/_header_navigation' # expects a file at /batman/html/layouts/_header_navigation.html
{% endhighlight %}

Your app will try to load a file relative to [`Batman.config.pathToHTML`](/docs/configuration.html) to use as this view's HTML. Note that you don't need to add `.html` to the `source` string.

### Binding to Custom Views

To add a custom view, use the [`data-view` binding](/docs/api/batman.view_bindings.html#data-view) and pass the name of your view class, relative to your app's namespace. For example, to bind to `App.CustomInputView`, you would use:

{% highlight html %}
<div data-view='CustomInputView'>
  <!-- your HTML here, or provided by CustomInputView::source or CustomInputView::html -->
</div>
{% endhighlight %}

## Backing Views

Some of the more complex bindings will create a new `View` (or many) to allow
them to manage the DOM. Such views are called *backing views*. For example,
using `data-foreach` will create a backing view for each item being iterated
over, containing a reference to the item for that iteration.

## Loading Views

Views are not parsed or added to the DOM when they're first constructed.
Instead, they're lazily loaded when you perform certain operations on them.

- If a view is in the DOM, adding to its subview set will cause the subview and
  its entire subtree to be added to the DOM. Removing a subview will
automatically remove it from the DOM.
