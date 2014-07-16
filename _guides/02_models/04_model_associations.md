# Model Associations

Model associations define relationships between models.

### Defining Associations

Associations are defined inside the model definition using `@belongsTo`, `@hasMany`, and `@hasOne`. Each association function takes:

- A label (string), which is used for the accessor name & encoder name
- An options object, for configuring the association.

For example, a deck of playing cards might be modeled like this:

```coffeescript
class MyApp.Deck extends Batman.Model
  @resourceName: 'deck'
  @encode 'brand'
  @hasMany 'cards', inverseOf: 'deck' # will look for `deck_id` on cards

class MyApp.Card extends Batman.Model
  @resourceName: 'card'
  @encode 'suit', 'rank', 'deck_id'
  @belongsTo 'deck', inverseOf: 'cards' # will match its `deck_id` to a deck's `id`

  @accessor 'fullName', -> "#{@get('rank')} of #{@get('suit')}"
  @delegate 'brand', to: 'deck'
```

Now, you can access the cards from their `Deck`:

```coffeescript
deck.get('cards')        # => Batman.AssocationSet containing `Card`s
deck.get('cards.length') # => 52
deck.get('cards').mapToProperty('fullName')
# => ["Ace of Spades", "Queen of Hearts", ...]
```

Similarly, you can access a `Deck` from a `Card`:

```coffeescript
aceOfSpades.get('deck')         # => a Deck instance (actually a BelongsToProxy)
aceOfSpades.get('deck.brand')   # => "Bicycle"
aceOfSpades.get('brand')        # => "Bicycle"
```

Associations are very configurable: see the [Model Associations API docs](/docs/api/batman.model_associations.html) for more detail about association options.

### Asynchronicity and Association Values

In fact, association accessors return special objects:

- `@hasMany` returns a `Batman.AssociationSet`. It is a `Batman.Set` tracking the [model's `loaded` set](/docs/api/batman.model.html#class_function_loaded) for foreign key matches.
- `@belongsTo` returns a `Batman.BelongsToProxy`. All properties are delegated associated record. The original record is available at the proxy's `"target"` accessor.

Using these special objects allows batman.js to account for asynchronous loading. For example, a `Batman.AssociationSet` may be rendered in a `Batman.View` even before its records are loaded. When the records are loaded, the view will be updated automatically. `Batman.BelongsToProxy` provides the same functionality.

To avoid asynchronous loading, use the `saveInline` option on your association.
