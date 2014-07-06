class Autolink
  @CLASS_REGEXP: ///                   # "test" : http://rubular.com/r/aCUg3nq6fC
              (?!\[)                        # not already a link (preceded by "[")
              (`                            # Wrapped in `
                Batman                      # starts with Batman
                (?:\.[A-Z][A-Za-z]+)+       # Has one or more CamelCased words which are joined by .
              `)
              (?![\s\w]*\]\()               # not already a link (followed by " some topic](")
            ///g                            # all of them

  @BINDING_REGEXP: ///
              (?!\[)                        # not already a link (preceded by "[")
              (`                            # Wrapped in `
                data                        # starts with data
                -[a-z]+                     # has a binding name
                (?:\-[^`\s=]+)?             # might have a binding argument (`data-addclass-error` or `data-bind-\#{attr}`)
              `)
              (?![\s\w]*\]\()               # not already a link (followed by " some topic](")
            ///g

  @_BINDING_SPECIAL_CASES: {
    "data-renderif"   : "data-renderif / data-deferif"
    "data-deferif"    : "data-renderif / data-deferif"
    "data-showif"     : "data-showif / data-hideif"
    "data-hideif"     : "data-showif / data-hideif"
    "data-addclass"    : "data-addclass / data-removeclass"
    "data-removeclass" : "data-addclass / data-removeclass"
  }

  @insertLinks: (text="", generator) ->
    newText = text.replace @CLASS_REGEXP, (match, className, offset, string) =>
      pageId = @generateId(className.replace(/`/g, ''))
      if generator.hasId(pageId)
        @_generateAPILink(className, "#{pageId}.html")
      else
        @_registerUndocumented(className)

    newText = newText.replace @BINDING_REGEXP, (match, bindingName, offset, string) =>
      bindingParts = bindingName.replace(/`/g, '').split("-")
      cleanBindingName = "#{bindingParts[0]}-#{bindingParts[1]}"
      if generator.hasMethod("batman.view_bindings", cleanBindingName)
        @_generateAPILink(bindingName, "batman.view_bindings.html##{cleanBindingName}")
      else if specialCase = @_BINDING_SPECIAL_CASES[cleanBindingName]?
        @_generateAPILink(bindingName, "batman.view_bindings.html##{specialCase}")

      else
        @_registerUndocumented(bindingName)
    newText

  @generateId: (title) -> encodeURIComponent(title.replace(/\s/g, '_').toLowerCase())
  @_generateAPILink: (str, page) ->
        link = "[#{str}](/docs/api/#{page})"

  @_registerUndocumented: (name) ->
      if !@_undocumented[name]
        @_undocumented[name] = true
        console.warn "-----> No API Documentation for #{name}"
      name

  @_undocumented: {}

module.exports = {Autolink}