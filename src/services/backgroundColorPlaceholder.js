export default function getBackgroundPlaceholder(colors, randomSeed) {
  const defaultColors = ['#73b61c', '#89c366', '#51af5f', '#55c39e', '#b4a50b']
  const placeholderColors = Array.isArray(colors) ? colors : defaultColors
  const positions = [
    'top left',
    'top center',
    'top right',
    'center left',
    'center center',
    'center right',
    'bottom right',
    'bottom center',
    'bottom left',
  ]
  const backgroundPlaceholder = placeholderColors
    .slice(0, positions.length)
    .map((color, index, array) => {
      const changeFactor = randomSeed % 2 === 0 ? -5 : 5
      const size = 80 + changeFactor / array.length * index
      const newGradient = `radial-gradient(circle at ${
        positions[index]
      }, ${color}, rgba(255,0,0,0) ${size}%)`
      return newGradient
    })
    .join(', ')
  return `${backgroundPlaceholder}`
}
