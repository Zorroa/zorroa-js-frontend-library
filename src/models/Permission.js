export default class Permission {
  constructor (json) {
    this.id = json.id
    this.name = json.name
    this.type = json.type
    this.description = json.description
    this.immutable = json.immutable
  }

  authority () {
    return this.type + '::' + this.name
  }
}
