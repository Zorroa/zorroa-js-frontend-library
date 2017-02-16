
/* ----------------------------------------------------------------------
 Given the asset list, asset panel width, and suggested thumbnail size,
 Compute the positions & size of each thumbnail for a a given layout.

 Inputs:
 assets        - Array of { width, height, parentId } matching external asset array
 panelWidth    - Width in CSS pixels of desired display width
 thumbSize     - Target size of thumbnail
 showMultipage - True if results should be collapsed into multipage docs

 The return value is an object that contains { position, multipage, collapsed }:
 position      - Array that matches the input array <assets> 1:1 where each
                 entry in the output array is an object with the following
                 values in css pixel units: { x, y, width, height }
 multipage     - Object indexed by parentId containing the indices in <assets>
                 for the first 3 sibling assets.
 collapsed     - Total number of assets collapsed into multipage docs
*/

export function masonry (assets, panelWidth, thumbSize, showMultipage) {
  let idealAspectSum = panelWidth / thumbSize
  const proposedRowHeight = panelWidth / idealAspectSum
  const margin = 5

  let rowLengths = [0]
  let rowAspects = [0]
  let rowEmptys = [0]
  let aspects = []
  let multipage = {}
  let collapsed = 0

  // Make a list of rows
  // Shove thumbs into rows as long as they'll fit.
  for (var i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const { width, height, parentId } = asset

    let collapse = false
    if (showMultipage) {
      // Collapse siblings by setting the aspect to zero.
      // The height and y position are retained to set the Pager top.
      if (parentId) {
        const pages = multipage[parentId]
        if (!pages) {
          multipage[parentId] = [i]
        } else {
          collapse = true
          ++collapsed
          if (pages && pages.length < 3) {
            multipage[parentId] = [...pages, i]
          }
        }
      }
    }

    let aspect = collapse ? 0 : Math.min(3, width / height)
    aspects[i] = aspect

    const rowIndex = rowLengths.length - 1

    // Let's say it'll fit if the space left in the row is
    // more than half the width of the thumb being considered
    if (rowAspects[rowIndex] + aspect / 2 < idealAspectSum) {
      rowLengths[rowIndex]++
      rowAspects[rowIndex] += aspect
      if (!aspect) rowEmptys[rowIndex]++
    } else {
      rowLengths.push(1)
      rowAspects.push(aspect)
      rowEmptys.push(aspect ? 0 : 1)
    }
  }

  // Now take a pass through all the rows,
  // and adjust each one to fit in the exact panel width provided
  let positions = []
  let curY = 0
  const numRows = rowLengths.length
  for (let r = 0, assetIndex = 0; r < numRows; r++) {
    const rowLength = rowLengths[r]
    let curX = 0

    const numMargins = rowLength - rowEmptys[r] - 1
    let rowWidthSansMargins = panelWidth - margin * numMargins
    let rowHeight = rowWidthSansMargins / rowAspects[r]

    // Special handling for the last row -- don't expand it to fit unless it's already close
    if (r === numRows - 1 && (rowAspects[r] / idealAspectSum < 0.75)) {
      rowHeight = proposedRowHeight
    }

    // Now that we know how big everything should be, store the final sizes
    for (let c = 0; c < rowLength; c++, assetIndex++) {
      const width = Math.floor(rowHeight * aspects[assetIndex])
      let position = { x: curX, y: curY, width: width, height: rowHeight }
      curX += width ? width + margin : 0
      positions.push(position)
    }
    curY += rowHeight + margin
  }

  return { positions, multipage, collapsed }
}

export function grid (assets, panelWidth, thumbSize, showMultipage) {
  const numColumns = Math.floor(panelWidth / thumbSize)
  const numMargins = numColumns - 1
  const margin = 5
  const thumbWidth = (panelWidth - margin * numMargins) / numColumns

  var j = 0
  let positions = []
  let multipage = {}
  let collapsed = 0

  for (var i = 0; i < assets.length; i++) {
    const asset = assets[i]
    const { parentId } = asset
    if (showMultipage) {
      if (parentId) {
        const pages = multipage[parentId]
        if (!pages) {
          multipage[parentId] = [i]
        } else {
          ++collapsed
          if (pages && pages.length < 3) {
            multipage[parentId] = [...pages, i]
          }
          // Zero width, but valid y & height for Pager
          const y = positions[positions.length - 1].y
          positions.push({x: 0, y, width: 0, height: thumbWidth})
          continue
        }
      }
    }

    const columnIndex = (j % numColumns)
    const rowIndex = Math.floor(j / numColumns)
    ++j

    positions.push({
      x: thumbWidth * columnIndex + margin * columnIndex,
      y: thumbWidth * rowIndex + margin * rowIndex,
      width: thumbWidth,
      height: thumbWidth
    })
  }

  return { positions, multipage, collapsed }
}
