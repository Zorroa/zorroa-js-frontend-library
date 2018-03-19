export function articulateQuality (quality) {
  if (quality > 75) {
    return 'Best'
  }

  if (quality > 50) {
    return 'Good'
  }

  return 'Fast'
}
