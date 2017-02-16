export function unCamelCase (str) {
  return str && str
    // insert a space between lower & upper
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // space before last upper in a sequence followed by lower
    .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
    // uppercase the first character
    .replace(/^./, function (str) { return str.toUpperCase() })
}

export function formatDuration (seconds, fps) {
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = pad(date.getUTCSeconds())
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`
  } else if (fps) {
    const ff = pad(Math.round(fps * date.getUTCMilliseconds() / 1000))
    return `${mm}:${ss}:${ff}`
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

function pad (string, digits) {
  return ('0' + string).slice(-(digits || 2))
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

// Add all sibling assets in allAssets to assetIds.
// WARNING: requires multiple passes over allAssets.
export function addSiblings (assetIds, allAssets) {
  const parentIds = new Set()
  assetIds.forEach(id => {
    const index = allAssets.findIndex(asset => (asset.id === id))
    const parentId = allAssets[index].parentId()
    if (parentId) parentIds.add(parentId)
  })
  allAssets.forEach(asset => {
    const parentId = asset.parentId()
    if (parentId && parentIds.has(parentId)) assetIds.add(asset.id)
  })
}

export function equalSets (as, bs) {
  if (as.size !== bs.size) return false
  for (var a of as) if (!bs.has(a)) return false
  return true
}

/* ----------------------------------------------------------------------
Execute a sequence of promises, with a max limit
on the number of promises in flight at once.

'data' is an array containing the data needed to make each promise
  each element of 'data' is passed to 'mkPromiseFn'
'mkPromiseFn' is a callback function that generates a promise
  called once per item in 'data', passed the single datum, takes only that 1 param
'optQueueSize' is an OPTIONAL number specifying the max queue length
  negative optQueueSize == #data/n (percentage), e.g. -1 for no limit, -2 for n/2, etc...
  default optQueueSize == sqrt(data.length)
'optProgressFn' is an OPTIONAL callback that is called once for every completed promise
and passed the number of completed items

Returns a promise that resolves when all promises in the queue resolve,
or rejects when the first promise in the queue rejects,
just like Promise.all()

Resolves with an array of the results, in the same order as 'data'
Rejects with the first error that occurs
*/
export function makePromiseQueue (data, mkPromiseFn, optQueueSize, optProgressFn) {
  return new Promise((resolve, reject) => {
    const n = data.length
    optQueueSize = optQueueSize || Math.round(Math.sqrt(n))
    if (optQueueSize < 0) optQueueSize = n / Math.abs(optQueueSize)
    optQueueSize = Math.max(1, Math.min(n, optQueueSize))

    let dataResults = []
    let nextDataToProcess = 0
    let totalFinished = 0

    let start = (idx) => {
      nextDataToProcess++
      mkPromiseFn(data[idx])
      .then((results) => {
        totalFinished++
        dataResults[idx] = results
        if (totalFinished >= n) resolve(dataResults)
        else optProgressFn && optProgressFn(totalFinished, n)
        if (nextDataToProcess < n) start(nextDataToProcess)
      })
      .catch(err => reject(err))
    }

    for (var i = 0; i < optQueueSize; i++) start(i)
  })
}
