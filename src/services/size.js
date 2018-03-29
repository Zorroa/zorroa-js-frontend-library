/**
 * Given the size of a parent element, this will calculate what size the child
 * needs to be to fit within the parent element. If the containBackground property
 * is true it behaves like the CSS style `background-size: contain`, otherwise it's
 * like `background-size: cover.` It returns the width, height, and cooridnates needed
 * to scale and center an image. This is useful for sizing content to fit within
 * canvas elements
 */
export function size ({
  parentWidth,
  parentHeight,
  childWidth,
  childHeight,
  containBackground
}) {
  const childRatio = childWidth / childHeight
  const containerRatio = parentWidth / parentHeight
  const shouldContainBackground = containBackground ? (childRatio > containerRatio) : (childRatio < containerRatio)
  let width = parentWidth
  let height = parentHeight

  if (shouldContainBackground) {
    height = width / childRatio
  } else {
    width = height * childRatio
  }

  const x = (parentWidth - width) / 2
  const y = (parentHeight - height) / 2

  return {
    width,
    height,
    x,
    y
  }
}

export function resizeByAspectRatio ({
  height,
  width,
  newHeight,
  newWidth
}) {
  if (newWidth !== undefined) {
    return {
      height: (height / width) * newWidth,
      width: newWidth
    }
  }

  return {
    height: newHeight,
    width: (height / width) * newHeight
  }
}
