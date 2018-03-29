export default class Permission {
  static GroupType = 'zorroa' // This is named `zorroa` to prevent namespace clashes when in an SSO enviroment
  static UserType = 'user'

  static Developer = 'developer'
  static Manager = 'manager'
  static Administrator = 'administrator'
  static Everyone = 'everyone'
  static Share = 'share'

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

  get fullName () {
    return this.authority()
  }

  equals (name, type) {
    if (!name || !type) return false
    if (this.name !== name) return false
    if (this.type !== type) return false
    return true
  }
}
