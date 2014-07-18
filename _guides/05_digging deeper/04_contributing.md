# Contributing

Thanks for your interest in contributing to batman.js! There are several ways you can help.

## Share Your Experience 

We welcome your stories of success (or otherwise) with batman.js. You can share your experience by: 

- Mentioning [@batmanjs](https://twitter.com/batmanjs) on Twitter
- Starting a thread on the [google group](https://groups.google.com/forum/#!forum/batmanjs)
- Striking up a conversation in our IRC channel at `#batmanjs` on chat.freenode.net
- Opening an issue on [the Github repo](https://github.com/batmanjs/batman)

## Guides

To improve the guides, make a pull request to this website's source code, [`batmanjs/batmanjs.github.io`](https://github.com/batmanjs/batmanjs.github.io). 

To edit the guides: 

- Install [jekyll](http://jekyllrb.com) and the JS dependencies: 

  ```
  gem install jekyll
  npm install 
```

- Start the jekyll server in watch mode:

  ```
  jekyll serve --watch
```
  
  Then, open the local version of the site at http://localhost:4000

- Modify the guides (found in `_guides/`)
- In another console, run the guide generator:
  
  ```
  chmod +x bin/generate_guides
  bin/generate_guides
```

- Refresh the local guide page. You should see your changes!

## API Docs

The API docs are kept in the batman.js repo, [`batmanjs/batman`](https://github.com/batmanjs/batman). There's also [a documentation readme](https://github.com/batmanjs/batman/blob/master/docs/README.md) with instructions about how the docs are parsed for presentation.

After you've updated the API docs, you can preview the changes in your local copy of `batmanjs/batmanjs.github.io`: 

``` 
$ cd ~/code/batmanjs.github.io
$ # --dir is the path to batman.js documentation:
$ bin/generate_docs --dir ~/code/batman/docs 
$ jekyll serve
```

Now, your local batman.js website will have updated API docs!

## Code

The batman.js repo ([`batmanjs/batman`](https://github.com/batmanjs/batman)) has instructions for contributing to the batman.js source. If there's something you've found useful, please share it with us! 


