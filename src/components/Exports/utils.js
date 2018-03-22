export function articulateQuality (quality) {
  if (quality === 'best') {
    return 'Best'
  }

  if (quality === 'default') {
    return 'Good'
  }

  if (quality === 'fast') {
    return 'Fast'
  }

  return quality
}
