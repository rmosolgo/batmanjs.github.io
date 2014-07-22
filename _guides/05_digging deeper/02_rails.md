# Batman.js and Rails

Ruby on Rails isn't required for a batman.js app, but there are some helpers for Rails-batman.js integration.

## Batman.RailsStorage 

`Batman.RailsStorage` is a storage adapter for connecting to Rails' default JSON APIs. Check out the `Batman.RailsStorage` API docs for a description of features.

## batman-rails

`batman-rails` is a Ruby Gem which allows you to easily use batman.js inside a Rails 3.2+ application. It takes care of a number of things for you:

- Vendoring the batman.js source into your app
- Generating your project structure within your Rails app
- Preloading HTML templates for batman.js

#### Get the Gem

Getting the gem is simple. Simply add the following line to your `Gemfile`:

```ruby
gem 'batman-rails'
```

Then simply tell `bundler` to install it:

```bash
$ bundle install
```

#### Create a Batman.js Application

Now that `batman-rails` is installed, we can use the normal Rails generator system to generate the skeleton for our batman.js application.

```bash
$ rails generate batman:app
```

The structure of this app will be exactly the same as described in [Directory Structure](/docs/structure.html), but it will live within our Rails app folder. You can find your newly created app in `app/assets/batman`.

#### Preloading Templates 

`batman-rails` comes with a view helper to preload your batman.js templates. This way, batman.js won't have to request them by AJAX. 

Add to `app/layouts/batman.html.erb`:

```html
  <head> 
    <!-- ... -->
    <%= batman_define_views %>
  </head>
```

`batman_define_views` also takes a `path:` option, in case your HTML isn't in `app/assets/batman/html`.

#### Using a Local Copy of Batman.js

If you don't want to use the version of batman.js provided by `batman-rails`, you can provide a version yourself. You might do this if you wanted to use a prerelease version of batman.js. 

1. Get a version of batman.js and put it in `app/assets/batman/lib`
2. Remove from your app's coffee file:

  ```coffeescript
#= require batman/batman
```

3. In its place, add: 

  ```coffeescript
#= require lib/batman
```

