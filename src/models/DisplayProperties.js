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

// Return existing or create a new propertry in th passed-in array
function _getOrAdd (name, displayProperties) {
  const index = displayProperties.findIndex(d => (d.name === name))
  let dp = null
  if (index >= 0) {
    dp = displayProperties[index]
  } else {
    dp = new DisplayProperties({name})
    displayProperties.push(dp)
  }
  return dp
}

// Create hierarchical DisplayProperties for field rendering
export function displayPropertiesForFields (fields) {
  let displayProperties = []
  for (let field of fields) {
    const namespaces = field.split('.')
    let dp = null
    for (let name of namespaces) {
      if (dp && !dp.children) {
        dp.children = []
      }
      dp = _getOrAdd(name, dp ? dp.children : displayProperties)
    }
  }
  return displayProperties
}

import { unCamelCase } from '../services/jsUtil'

// Flatten a hierarchical display property tree into a list of:
//   { title, field, displayProperties }
// Section titles are inserted with field=null and arrays are
// expanded into array[i] titles.
function _flatten (displayProperties, field, asset, list) {
  if (displayProperties.children && displayProperties.children.length) {
    const rawValue = asset.rawValue(field)
    const isArray = Array.isArray(rawValue)
    if (isArray) {
      // One title per entry, skipping top-level array object title
      rawValue.forEach((child, i) => {
        const title = unCamelCase(`${displayProperties.name}[${i}]`)
        list.push({ title , field, displayProperties })
        displayProperties.children.forEach(child => _flatten(child, `${field}.${i}.${child.name}`, asset, list))
      })
    } else {
      // Add a title entry for the section, then all children
      const title = unCamelCase(displayProperties.name)
      list.push({title, field, displayProperties})
      displayProperties.children.forEach(child => _flatten(child, `${field}.${child.name}`, asset, list))
    }
  } else {
    // Field entry, no extra titles
    const title = unCamelCase(displayProperties.name)
    list.push({title, field, displayProperties})
  }
}

export function flatDisplayPropertiesForFields (fields, asset) {
  const displayProperties = displayPropertiesForFields(fields)
  const list = []
  displayProperties.forEach(dp => _flatten(dp, dp.name, asset, list))
  return list
}
