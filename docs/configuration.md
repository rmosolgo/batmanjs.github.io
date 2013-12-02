---
layout: docs
title: Configuration
prev_section: installation
next_section: controllers
---

Batman accepts some global configurations that affect all apps running on the page. All configuration settings are attributes of `Batman.config`. Although configurations are checked at runtime, it's good practice to set them before defining your app:

{% highlight coffeescript %}
Batman.config.pathToHTML = '/templates'
Batman.config.usePushState = false

class MyApp extends Batman.App
  # ...
{% endhighlight %}

### pathToApp
__Default: `"/"`__

Use this if your Batman app is loaded at a specific path (rather than `/`). For example, if you load your app at `/app`, you'd configure Batman:

{% highlight coffeescript %}
  Batman.config.pathToApp = '/app'
{% endhighlight %}

Any Batman-generated routes will be prefixed with `/app`.

### pathToHTML
__Default: `"/html"`__

If the app hasn't already loaded the HTML to render a view, it will request the HTML by AJAX. `pathToHTML` will be used as a prefix for Batman's HTML requests.

The [`Batman.rails`](https://github.com/batmanjs/batman/blob/master/src/extras/batman.rails.coffee) extra sets `Batman.config.pathToHTML= '/assets/batman/html'`.

### fetchRemoteHTML
__Default: `true`__

Batman fetches HTML for views which aren't loaded yet. If `fetchRemoteHTML` is false, Batman throws an error if needed HTML is not found in the DOM. (The [`data-view` binding](/docs/api/batman.view_bindings.html#data-view) may be used to provide HTML in the DOM.)

### usePushState
__Default: `true`__

Set to `false` to use Batman's hashbang navigator instead of the (default) `pushState` navigator. (Don't worry, Batman gracefully degrades to the hashbang navigator automatically if `pushState` isn't supported.)

### protectFromCSRF
__Default: `false`__

Used by the [`Batman.rails`](https://github.com/batmanjs/batman/blob/master/src/extras/batman.rails.coffee) extra. If `protectFromCSRF` is true, Batman sends CSRF token as a request header (`X-CSRF-Token`). Batman uses `metaNameForCSRFToken` to find the correct meta tag.

The [`Batman.rails`](https://github.com/batmanjs/batman/blob/master/src/extras/batman.rails.coffee) extra sets `Batman.config.protectFromCSRF = true`, but you must set it yourself if you're using Rails-style CSRF tokens _without_ the `Batman.rails` extra.

### metaNameForCSRFToken
__Default: `"csrf-token"`__

If `protectFromCSRF` is true, this will be used to find the meta tag whose `contents` contain the CSRF token. This default is set in the [`Batman.rails`](https://github.com/batmanjs/batman/blob/master/src/extras/batman.rails.coffee) extra.

### cacheViews
__Default: `false`__

If set to true, Batman will cache `Batman.View` instances between `render` calls. View caching is opt-in [while its implementation is finalized](https://github.com/batmanjs/batman/issues/805).

