export default class Processor {
  constructor (json) {
    this.id = json.id
    this.filters = json.filters
    this.description = json.description
    this.name = json.name
    this.shortName = json.shortName
    this.module = json.module
    this.type = json.type
    this.display = json.display

    this.pluginId = json.pluginId
    this.pluginName = json.pluginName
    this.pluginVersion = json.pluginVersion
    this.pluginLanguage = json.pluginLanguage
  }

  ref (args) {
    return new ProcessorRef({
      args: args,
      className: this.name,
      language: this.pluginLanguage
    })
  }
}

export class ProcessorRef {
  constructor (json) {
    this.className = json.className
    this.args = json.args
    this.language = json.language
    this.execute = json.execute && json.execute.map(p => (new ProcessorRef(p)))
    this.filters = json.filters && json.filters.map(f => (new ProcessorFilter(f)))
  }
}

export class ProcessorFilter {
  constructor (json) {
    this.expr = json.expr
    this.drop = json.drop
  }
}
