[batmanjs.github.io](http://batmanjs.org)
==================

## Development

http://batmanjs.org is run on GitHub pages and uses Jekyll.

To test your changes locally:

```bash
gem install jekyll
jekyll serve
```

Then check out http://localhost:4000.

## Generating the Guides

Raw text for guides is in `_guides/`. To regenerate the pages after editing them, run

```
bin/generate_guides
```


## Generating the API documentation

The API docs are generated from a set of literate CoffeeScript files in the main batman.js repository.
To generate them yourself, make sure you've cloned the main repo, and execute the following command from within your copy of the `batmanjs.github.io` repo.

```bash
cd ~/code/batmanjs.github.io                # or wherever you keep it
npm install
bin/generate_docs --dir ~/code/batman/docs  # or wherever you keep batman.js source
```
