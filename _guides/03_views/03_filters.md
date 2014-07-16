# View Filters

View filters modify keypath values in view bindings. Batman.js's view filters are inspired by [Liquid filters](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers#advanced-output-filters).

Filters may be used to:

- modify values for presentation (eg, `truncate`, `downcase`)
- mix keypath values and [literals](/docs/bindings.html#keypath-literals) (eg, `append`, `pluralize`)
- modify event handlers (eg, `withArguments`, `toggle`)

See the [`Batman.View Filters` documentation](/docs/api/batman.view_filters.html) for a full list of available view filters.

## Using Filters

You can apply filters to bindings by joining them with `" | "`. For example, to apply the `truncate` filter with argument `100`:

```html
<p data-bind="post.body | truncate 100"></p>
```

The above `<p>` will have the first 100 characters of the post's body. Whenever the `post.body` changes, it will be retruncated and the `<p>`'s `innerHTML` will be updated.

Filter chains can be arbitrarily long:

```html
<span data-bind="knight.name | prepend 'Sir ' | append ', the honourable'"></span>
```

and filter chains can use _other keypaths_ as arguments to the filters:

```html
<span data-bind="person.name | prepend ' ' | prepend person.title"></span>
```

The above `<span>`'s `innerHTML` will be updated whenever the person's name _or_ title changes. Both keypaths are tracked by the binding.

__Note that filtered keypaths cannot propagate DOM changes to JavaScript__ because values can't always be "unfiltered". Filters only affect Javascript-to-DOM bindings, not DOM-to-Javascript!
