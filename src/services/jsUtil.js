export function unCamelCase (str) {
  return str && str
    // insert a space between lower & upper
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // space before last upper in a sequence followed by lower
    .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
    // uppercase the first character
    .replace(/^./, function (str) { return str.toUpperCase() })
}

export function formatDuration (seconds) {
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = pad(date.getUTCSeconds())
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`
  }
  return `${mm}:${ss}`
}

function pad (string) {
  return ('0' + string).slice(-2)
}

export function parseFormattedFloat (obj) {
  if (!obj) return
  if (typeof obj === 'number') return obj
  if (typeof obj === 'string') {
    return parseFloat(obj.replace(',', ''))
  }
}

export function humanFileSize (size) {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

// Returns an ARRAY of unique ids for dragging or context click
// that either contains the currently selected ids or the isolated
// id depending on whether the isolated id is in the selected set.
export function isolateSelectId (id, selectedIds) {
  let isolatedIds = []
  if (selectedIds && selectedIds.size) {
    if (selectedIds.has(id)) {
      isolatedIds = [...selectedIds]  // In set, return all selected
    } else {
      isolatedIds = [id]              // Drag-unselected, return isolated
    }
  } else {
    isolatedIds = [id]                // Nothing selected, return isolated
  }
  return isolatedIds
}
