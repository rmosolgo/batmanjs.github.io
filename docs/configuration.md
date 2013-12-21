---
layout: docs
title: Configuration
prev_section: installation
next_section: controllers
---

batman.js contains some settings affecting all apps running on the page. These settings are attributes of the global `Batman.config` object. It's good practice to set these values before defining your app, like so:

{% highlight coffeescript %}
Batman.config.pathToHTML = '/templates'
Batman.config.usePushState = false

class MyApp extends Batman.App
  # ...
{% endhighlight %}

### pathToApp
__Default: `"/"`__

Use this if your batman.js app is loaded from a path other than `/`. For example, if you load your app at `/app`, you'd use:

{% highlight coffeescript %}
  Batman.config.pathToApp = '/app'
{% endhighlight %}

Any generated routes will be then be prefixed with `/app`.

### pathToHTML
__Default: `"/html"`__

If the app hasn't already loaded the HTML to render a view, it will request the HTML with an AJAX request. `pathToHTML` is used as the prefix for these requests.

The [`Batman.rails`](https://github.com/batmanjs/batman/blob/master/src/extras/batman.rails.coffee) extra sets `Batman.config.pathToHTML= '/assets/batman/html'`.

### fetchRemoteHTML
__Default: `true`__

batman.js automatically fetches a view's HTML if it hasn't been loaded yet. If `fetchRemoteHTML` is false, an error will be thrown instead.

### usePushState
__Default: `true`__

Set to `false` to use batman.js's hashbang navigator instead of the (default) `pushState` navigator. Note: the `pushState` navigator automatically degrades to the hashbang navigator if not supported by the browser.

### protectFromCSRF
__Default: `false`__

Used by the [`Batman.rails`](https://github.com/batmanjs/batman/blob/master/src/extras/batman.rails.coffee) extra. If `protectFromCSRF` is true, batman.js sends CSRF token as a request header (`X-CSRF-Token`). batman.js uses `metaNameForCSRFToken` to find the correct meta tag.

The [`Batman.rails`](https://github.com/batmanjs/batman/blob/master/src/extras/batman.rails.coffee) extra sets `Batman.config.protectFromCSRF = true`, but you must set it yourself if you're using Rails-style CSRF tokens _without_ the `Batman.rails` extra.

### metaNameForCSRFToken
__Default: `"csrf-token"`__

If `protectFromCSRF` is true, the contents of the meta tag with this name will be used as the CSRF token. This default is set in the [`Batman.rails`](https://github.com/batmanjs/batman/blob/master/src/extras/batman.rails.coffee) extra.

### cacheViews
__Default: `false`__

If set to true, batman.js will cache `Batman.View` instances between `render` calls. View caching is opt-in [while its implementation is finalized](https://github.com/batmanjs/batman/issues/805).

