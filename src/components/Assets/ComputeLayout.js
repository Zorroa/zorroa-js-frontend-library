
/* ----------------------------------------------------------------------
Given the asset list, asset panel width, and suggested thumbnail size,
Compute the positions & size of each thumbnail for a masonry layout

The return value is an array that matches the input array <assets> 1:1
Each entry in the output array is an object with the following keys: x, y, width, height
The values are in css pixel units
*/
export function masonry (assets, panelWidth, thumbSize) {
  let idealAspectSum = panelWidth / thumbSize
  const proposedRowHeight = panelWidth / idealAspectSum
  const margin = 5

  let rows = [[]]
  let rowAspects = [0]
  let aspects = []

  // Make a list of rows
  // Shove thumbs into rows as long as they'll fit.
  for (var i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const proxy = asset.proxies[0]
    let aspect = Math.min(3, proxy.width / proxy.height)
    aspects[i] = aspect

    const rowIndex = rows.length - 1
    // Let's say it'll fit if the space left in the row is more than half the width of the thumb being considered
    if (rowAspects[rowIndex] + aspect / 2 < idealAspectSum) {
      rows[rowIndex].push(i)
      rowAspects[rowIndex] += aspect
    } else {
      rows.push([i])
      rowAspects.push(aspect)
    }
  }

  // Now take a pass through all the rows,
  // and adjust each one to fit in the exact panel width provided
  let thumbPositions = []
  let curY = 0
  for (var r = 0; r < rows.length; r++) {
    const row = rows[r]
    let curX = 0

    const numMargins = row.length - 1
    let preAdjustedRowWidthSansMargins = rowAspects[r] * proposedRowHeight
    let rowExpandFactorSansMargins = panelWidth / preAdjustedRowWidthSansMargins
    const approximatePreAdjustedMargin = margin / rowExpandFactorSansMargins
    let preAdjustedRowWidth = rowAspects[r] * proposedRowHeight + approximatePreAdjustedMargin * numMargins

    let rowExpandFactor = panelWidth / preAdjustedRowWidth
    if (r === rows.length - 1 && preAdjustedRowWidth < panelWidth && rowExpandFactor > 1.25) {
      rowExpandFactor = 1
    }

    const actualRowHeight = Math.floor(proposedRowHeight * rowExpandFactor)
    for (var c = 0; c < row.length; c++) {
      const assetIndex = rows[r][c]
      const width = Math.floor(proposedRowHeight * aspects[assetIndex] * rowExpandFactor)
      let position = { x: curX, y: curY, width: width, height: actualRowHeight }
      curX += width + margin
      thumbPositions.push(position)
    }
    curY += actualRowHeight + margin
  }

  return thumbPositions
}

/* ----------------------------------------------------------------------
Given the asset list, asset panel width, and suggested thumbnail size,
Compute the positions & size of each thumbnail for a grid layout

The return value is an array that matches the input array <assets> 1:1
Each entry in the output array is an object with the following keys: x, y, width, height
The values are in css pixel units
*/
export function grid (assets, panelWidth, thumbSize) {
  const numColumns = Math.floor(panelWidth / thumbSize)
  const numMargins = numColumns - 1
  const margin = 5
  const thumbWidth = (panelWidth - margin * numMargins) / numColumns

  let thumbPositions = []
  for (var i = 0; i < assets.length; i++) {
    const columnIndex = (i % numColumns)
    const rowIndex = Math.floor(i / numColumns)

    thumbPositions.push({
      x: thumbWidth * columnIndex + margin * columnIndex,
      y: thumbWidth * rowIndex + margin * rowIndex,
      width: thumbWidth,
      height: thumbWidth
    })
  }

  return thumbPositions
}
