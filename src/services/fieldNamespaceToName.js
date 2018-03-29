import decamelize from 'decamelize'

export default function fieldNamespaceToName (field, includeRepresentation = true) {
  const parsedNamespaces = field.split('.')
  const name = decamelize(parsedNamespaces[1], ' ')
  const representation = includeRepresentation ? ` (${parsedNamespaces[2]})` : ''

  if (parsedNamespaces.length < 2) {
    return field
  }

  return `${name}${representation}`
}
