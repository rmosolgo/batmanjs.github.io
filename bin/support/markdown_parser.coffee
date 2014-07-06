marked = require('marked')
hljs   = require('highlight.js')

class MarkdownParser
  _batmanjsOptions:
    highlight: (code, lang) -> hljs.highlight('coffeescript', code).value
    tables: true
  constructor: (options={}) ->
    @options = {}
    for k, v of marked.defaults
      @options[k] = v
    for k, v of @_batmanjsOptions
      @options[k] = v
    for k, v of options
      @options[k] = v

  stringToTokens: (string) ->
    marked.lexer(string)

  tokensToHTML: (tokens) ->
    tokens.links ||= {} # required by marked for ... something.
    marked.Parser.parse(tokens, @options)

  stringToHTML: (string) ->
    tokens = @stringToTokens(string)
    html = @tokensToHTML(tokens)

module.exports = {MarkdownParser}