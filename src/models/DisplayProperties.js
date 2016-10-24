// DisplayProperties is a server-side schema that describes a user
// interface element, typically associated with a processor argument,
// or to edit asset fields.

export default class DisplayProperties {
  constructor (json) {
    this.name = json.name
    this.label = json.label
    this.toolTip = json.toolTip
    this.readOnly = json.readOnly
    this.required = json.required
    this.children = json.children ? json.children.map(item => (new DisplayProperties(item))) : null
    this.widget = json.widget
    this.options = json.options
    this.value = json.value
    this.min = json.min
    this.max = json.max
    this.digits = json.digits
    this.sensitivity = json.sensitivity
  }
}
