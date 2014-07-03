fs = require('fs')

class TemplateWriter
  templatePath: "#{__dirname}/../../_templates"
  destinationPath: "#{__dirname}/../.."

  constructor: (@templateName) ->

  write: (destination, replacements) ->
    content = @readTemplate()

    for key, replacement of replacements
      content = content.replace("#= #{key}", replacement)

    console.log("generating #{destination}")
    fs.writeFileSync("#{@destinationPath}/#{destination}", content)

  readTemplate: ->
    @constructor._templateContents ||= {} # assumes the template won't change, such performance!
    @constructor._templateContents[@templateName] ||= fs.readFileSync("#{@templatePath}/#{@templateName}").toString()

module.exports = {TemplateWriter}