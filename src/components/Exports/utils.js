export function articulateQuality(quality) {
  if (quality === 'veryslow') {
    return 'Best'
  }

  if (quality === 'medium') {
    return 'Good'
  }

  if (quality === 'fast') {
    return 'Fast'
  }

  if (quality > 75) {
    return 'Best'
  }

  if (quality > 50) {
    return 'Good'
  }

  if (quality >= 0) {
    return 'Fast'
  }

  return quality.toString()
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural
}

export function getClassFromNamespace(namespace) {
  const parsedNamespaces = namespace.split('.')
  return parsedNamespaces[parsedNamespaces.length - 1]
}
