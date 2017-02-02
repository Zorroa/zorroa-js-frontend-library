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

// SPE's time code format is hours:minutes:seconds:frames
const timeRE = /(\d+):(\d+):(\d+):(\d+)/
//
export function parseTimecodeMS (timecodeStr) {
  const matches = timeRE.exec(timecodeStr)
  if (matches.length !== 5) return 0
  const numbers = matches.slice(1).map(x => parseInt(x, 10))
  var time = 0
  time += numbers[0] * 3600 * 1000 // millis per hour
  time += numbers[1] * 60 * 1000 // millis per minute
  time += numbers[2] * 1 * 1000 // millis per second
  time += numbers[3] * (1 / 23.98) * 1000 // millis per frame (sony data all has 23.98 frames/sec)
  return time
}

export function remap (x, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((x - min1) / (max1 - min1))
}

export function clamp (v, min, max) {
  return Math.max(min, Math.min(max, v))
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

// Returns a set ids that either contains the currently selected ids
// or the isolated id depending on whether the isolated id is in the
// selected set.
export function isolateSelectId (id, selectedIds) {
  if (selectedIds && selectedIds.size && selectedIds.has(id)) {
    return selectedIds
  }
  return new Set([id])
}
