# Batman.js and Rails

## 1. batman-rails

`batman-rails` is a Ruby Gem which allows you to easily use batman.js inside a Rails 3.2 or 4.0 application. It takes care of a number of things for you:

- Vendoring the batman.js source into your app
- Generating your project structure within your Rails app
- Setting up JSON communication between your Rails and batman.js app

#### 1.1 Get the Gem

Getting the gem is simple. Simply add the following line to your `Gemfile`:

```ruby
gem 'batman-rails'
```

Then simply tell `bundler` to install it:

```bash
$ bundle install
```

#### 1.2 Create a batman.js application

Now that `batman-rails` is installed, we can use the normal Rails generator system to generate the skeleton for our batman.js application.

```bash
$ rails generate batman:app
```

The structure of this app will be exactly the same as described in [Directory Structure](/docs/structure.html), but it will live within our Rails app folder. You can find your newly created app in `MyApp/app/assets/batman`.
