# App Architecture

Batman.js is a _MVC framework_ for building _stateful_ client-side applications. If you understand these concepts, you'll build a better batman.js app!

## MVC Architecture

Model-View-Controller (MVC) is a common way of dividing an app's responsibilities. Batman.js borrows its MVC implementation from Rails and Cocoa. There are three main parts:

#### Models

Models define the _business objects_ in your application. For examples, the models in a blogging app might be `Post`, `Comment` and `User`. These classes may:

- validate incoming data
- persist data 
- be associated to other models in your app

[More About Models](/docs/models.html)

#### Views

Views connect your app to its users by rendering HTML and binding the page to your app. The "view layer" _includes_ HTML templates but goes beyond that: subclasses of `Batman.View` are also used for:

- creating reusable UI components
- handling complex user interactions
- rendering into different parts of the page

[More About Views](/docs/views.html)

#### Controllers

Controllers handle route changes. Routes invoke _controller actions_ which may:

- select & prepare data 
- render views on the page 
- persist changes made by the user (eg, clicking "Save")

[More About Controllers](/docs/controllers.html)

## Buidling a Stateful Application

A critical concern of a single-page app is [_state_](http://en.wikipedia.org/wiki/State_%28computer_science%29#Program_state), which refers to the information in a program's memory at a given time. Here are a few considerations for state in batman.js:

- __Storage is asynchronous.__ Especially if you're using JSON for persistence, loading & saving will be asynchronous. You should set up your app to use callbacks properly (or load some data into your app on page load).

- __Records "persist" in memory.__ When you fetch a record from storage, that record will remain in memory until the user leaves the page (or the record is destroyed). If you fetch the record from storage again, the in-memory copy will be _updated_, but not replaced. Values set on records will _stay_ set between controller actions.

- __Controllers are singletons.__ When you first dispatch a controller action, you instantiate that `Batman.Controller` subclass. That _same instance_ will be used to dispatch subsequent actions, so any accessors set on the controller will _stay_ set until you unset them! 

- __Views are objects.__ When batman.js renders HTML, it is "backed" by a `Batman.View` instance. The view object creates _state_ for that HTML by maintaining bindings between the HTML and your app. However, views _are_ destroyed between controller actions (unlike controllers and models).

