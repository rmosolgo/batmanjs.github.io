# Model Validations

Model validations create requirements that must be met before a record is saved. For example, we can require the presence of `title`:

```coffeescript
class MyApp.Post extends Batman.Model 
  @validate 'title', presence: true 
```

If you try to save a `Post` with no title, the operation will fail:

```coffeescript
post = new MyApp.Post(title: null)
post.save (err, record) ->
    err # => Batman.ErrorsSet containing validation errors
```

Remember, client-side validation should _always_ be accompanied by server-side validation.

## When Does Validation Happen?

Batman.js always validates a record before saving it. If the record fails validation, the record's errors (a `Batman.ErrorsSet`) is passed to the callback as `err`. 

You can handle this in your `save` callbacks:

```coffeescript
post.save (err, record) ->
  if err and err instanceOf Batman.ErrorsSet
    console.warn("Failed Validation!")
  else if err?
    throw err # there was a storage error
  else 
    console.log("Save was successful") 
```

You can also validate a record without saving by calling `validate`. 

```coffeescript 
post.validate (javascriptError, validationErrors) ->
```

The callback is fired with:

- any non-validation error that may have occured
- the record's errors (a `Batman.ErrorsSet`)

_Note_: Validation in batman.js is always asynchronous. This is so that the API is consistent regardless of the validations used.

## Validation Errors

You can access errors on a record by getting `errors` on that record: 

```coffeescript
post.get('errors') <# Batman.ErrorsSet #>
```

`Batman.ErrorsSet` is a subclass of `Batman.Set`, so you can iterate over it just like any other `Batman.Set`.

You can also access errors for a specific attribute at `"errors.#{fieldName}"`. For example, to get errors on a `Post`'s `title`:

```coffeescript
post.get('errors.title') # => <# Batman.Set #>
```

It returns a `Batman.Set` containing the errors on that attribute. 

Each error is a `Batman.ValidationError`. It responds to `"fullMessage"`, which returns a human-friendly error message. This is great for HTML bindings:

```html
<ul>
  <li data-foreach-err='post.errors'>
    <span data-bind='err.fullMessage'></span>
  </li>
</ul>
```

See also the `data-formfor` binding, which can provide automatic error display.

## Built-In Validations

Built in validators are attached by calling `@validate` with options designating how to calculate the validity of the attribute:

```coffeescript
class Post extends Batman.Model
  # ...
  @validate 'title', {presence: true}     # title must be present (not undefined or '')
  @validate 'body', {minLength: 10}       # body must be 10 characters long at least
  @validate 'title', {pattern: /^[A-Z]/}  # title must start with an uppercase letter
  @validate 'author', {email: true}       # author must be a valid email address
```

Option | Asserts that ...
--- | ---
`presence : true` | String value is existent (not undefined or null) and has length greater than 0
`numeric : true` | Value is or can be coerced into a number using `parseFloat`.
`greaterThan : Number` | Value is greater than the given number.
`greaterThanOrEqualTo : Number` | Value is greater than or equal to the given number.
`equalTo : Number` | Value is equal to the given number.
`lessThan : Number` | Value is less than the given number.
`lessThanOrEqualTo : Number` | Value is less than or equal to the given number.
`minLength : Number` | Value's `length` property is greater than the given number.
`maxLength : Number` | Value's `length` property is less than the given number.
`length : Number` | Value's `length` property is exactly the given number.
`lengthWithin : [Number, Number]`, `lengthIn : [Number, number]` | Value's `length` property is within the range `[lower, upper]`.
`inclusion : in : [list, of, acceptable, values]` | Value is equal to one of the values in an array.
`exclusion : in : [list, of, unacceptable, values]` | Value is not equal to any of the values in an array.
`regexp : /regexp/` | Value is matching the provided regular expression.
`email : true` | Value is an email address, per the [W3C HTML5 definition](http://www.w3.org/TR/html5/forms.html#valid-e-mail-ress).
`associated : true` | Associated record is also valid. If invalid, the message will be "#{associationName} is not valid".
`associatedFields : true` | Like `associated`, but adds error messages with the names of the fields on associated records, eg "Username must at least 10 characters" or "Favorite flavor is not included in the list".
`confirmation : true/String` | Record's `#{attr}_confirmation` value matches `#{attr}`. If option is a string, use that attribute instead of `#{attribute}_confirmation`.

## Custom Validation

You can easily define a custom validation by passing a function to `@validate`:

```coffeescript
class App.Product extends Batman.Model
  @validate 'name', (errors, record, attribute, callback) ->
    # custom validation ...
    callback()
```

The function takes `(errors, record, attribute, callback)`:

 + `errors`: the `Batman.ErrorsSet` for this record
 + `record`: the record being validated
 + `attribute`: the attribute  being validated
 + `callback`: a function to call once validation has been completed. Calling this function is __mandatory__: it enables validations to be asynchronous.

To show that the record is invalid, a validation function should call `errors.add(attribute, message)`.

You can also create custom validators by extending `Batman.Validator`.

## Conditional Validation

Validations can be skipped by including a conditional check. Pass `if` or `unless` as options to `@validate`:

```coffeescript
class Invoice extends Batman.Model
  @resourceName: 'invoice'
  @validate 'tax_1_rate', {presence: true, if: (errors, record, attribute) -> record.get('tax_1_enabled')} # tax 1 rate must be present if tax 1 is enabled
  @validate 'tax_2_rate', {presence: true, if: 'tax_2_rate'} # passing a string will look for an attribute or accessor with that name on the record
  @validate 'discount_rate', {presence: true, unless: 'discount_disabled'} # discount rate must be present unless discount is disabled
```
If you pass a string as `if` or `unless`, it will do a `@get(string)` on the record being validated. If you pass a function, it should have the signature `(errors, record, attribute)`:

- `errors`: the `Batman.ErrorsSet` for the record
- `record`: the record being validated
- `attribute`: the attribute being validated

## Custom Messages

Batman.js ships with straightforward messages for the built-in validators. However, if you need custom messages, there are several ways to add them.

1. __Pass a `message` option__. It may be a string or function. for example:
  ```
    @validate 'name', presence: true, message: "must be provided" # => "Name must be provided"
    @validate 'amount', in: [1,2,3], message: (attribute, messageKey, record) -> "can't be #{record.get('amount')}!"
  ```
1. __Use a custom validation__. In your custom validation, add the error with your custom message, for example:
  ```coffeescript
    errors.add("email_address", "must be provided to ensure that your password isn't lost!")
  ```
1. __Provide a custom translation__. In your locale, `errors.messages.#{messageKey}` should match the structure provided by batman.js ([see source](https://github.com/batmanjs/batman/blob/master/src/model/validations/validators.coffee)).
