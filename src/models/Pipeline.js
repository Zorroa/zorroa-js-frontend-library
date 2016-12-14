export default class Pipeline {
  constructor ({id, type, name, description, processors}) {
    this.id = id
    this.type = type
    this.name = name
    this.description = description
    this.id = id
    this.processors = processors && processors.map(json => new ProcessorRef(json))
  }
}

export class ProcessorRef {
  constructor ({ className, args, language, execute, filters }) {
    this.className = className
    this.args = args
    this.language = language
    this.execute = execute && execute.map(json => new ProcessorRef(json))
    this.filters = filters && filters.map(json => new ProcessorFilter(json))
  }
}

export class ProcessorFilter {
  constructor ({ expr }) {
    this.expr = expr
  }
}
