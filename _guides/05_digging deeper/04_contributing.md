# Contributing

Thanks for your interest in contributing to batman.js! There are several ways you can help.

## Be Part of the Community

Join the conversation about batman.js! You can participate by:

- Opening a bug report or feature request as a [Github issue](https://github.com/batmanjs/batman/issues)
- Striking up a conversation in our IRC channel at `#batmanjs` on chat.freenode.net
- Mentioning [@batmanjs](https://twitter.com/batmanjs) on Twitter
- Starting a thread on the [google group](https://groups.google.com/forum/#!forum/batmanjs)
- Participating in conversations on [the Github repo](https://github.com/batmanjs/batman)

## Contribute to the Codebase

There are several ways to contribute to the batman.js source code:

- Review [outstanding pull requests](https://github.com/batmanjs/batman/pulls)
- Triage [open issues](https://github.com/batmanjs/batman/issues?state=open)
- Solve _your problems_ by making a pull request 
- Solve _other people's problems_ by making a pull request

The best way to become a contributor is to start contributing! The batman.js repo ([`batmanjs/batman`](https://github.com/batmanjs/batman)) has instructions for working with the batman.js source. 

## Improve the Guides

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

## Improve the API Docs

The API docs are kept in the batman.js repo, [`batmanjs/batman`](https://github.com/batmanjs/batman). There's also [a documentation readme](https://github.com/batmanjs/batman/blob/master/docs/README.md) with instructions about how the docs are parsed for presentation.

After you've updated the API docs, you can preview the changes in your local copy of `batmanjs/batmanjs.github.io`: 

``` 
$ cd ~/code/batmanjs.github.io
$ # --dir is the path to batman.js documentation:
$ bin/generate_docs --dir ~/code/batman/docs 
$ jekyll serve
```

Now, your local batman.js website will have updated API docs!


