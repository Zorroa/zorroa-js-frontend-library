export function unCamelCase(str) {
  if (!str) return
  let buf
  // Convert upper and lower underscore to camel case,
  // skipping fields with leading underscore, e.g. _byte
  if (
    str.indexOf('_') > 0 &&
    (str === str.toUpperCase() || str === str.toLowerCase())
  ) {
    // convert all-upper-under to camelcase
    buf = str.toLowerCase().replace(/[-_]([a-z,A-Z])/g, function(g) {
      return g[1].toUpperCase()
    })
  } else {
    buf = str
  }

  return (
    buf
      // insert a space between lower & upper
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // space before last upper in a sequence followed by lower
      .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
      // uppercase the first character
      .replace(/^./, function(str) {
        return str.toUpperCase()
      })
  )
}

export function isValidEmail(email) {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export function formatDuration(seconds, fps) {
  if (seconds === undefined) return '??:??'
  const date = new Date(seconds * 1000)
  const hh = pad(date.getUTCHours())
  const mm = pad(date.getUTCMinutes())
  const ss = pad(date.getUTCSeconds())
  if (hh !== '00') {
    return `${hh}:${pad(mm)}:${ss}`
  } else if (fps) {
    const ff = pad(Math.round(fps * date.getUTCMilliseconds() / 1000))
    return `${mm}:${ss}:${ff}`
  }
  return `${mm}:${ss}`
}

export function epochUTCString(msec) {
  const d = new Date(msec)
  return d.toUTCString()
}

// SPE's time code format is hours:minutes:seconds:frames
const timeRE = /(\d+):(\d+):(\d+):(\d+)/
//
export function parseTimecodeMS(timecodeStr) {
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

export function lerp(x, min, max) {
  return min + (max - min) * x
}

export function unlerp(x, min, max) {
  return (x - min) / (max - min)
}

export function remap(x, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((x - min1) / (max1 - min1))
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function pad(string, digits) {
  return ('0' + string).slice(-(digits || 2))
}

export function parseFormattedFloat(obj) {
  if (!obj) return
  if (typeof obj === 'number') return obj
  if (typeof obj === 'string') {
    return parseFloat(obj.replace(',', ''))
  }
}

export function humanFileSize(size) {
  if (size === undefined || size === null) return '----'
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    ' ' +
    ['B', 'kB', 'MB', 'GB', 'TB'][i]
  )
}

// Returns a set ids that either contains the currently selected ids
// or the isolated id depending on whether the isolated id is in the
// selected set.
export function isolateSelectId(id, selectedIds) {
  if (selectedIds && selectedIds.size && selectedIds.has(id)) {
    return selectedIds
  }
  return new Set([id])
}

// Add all sibling assets in allAssets to assetIds.
// WARNING: requires multiple passes over allAssets.
export function addSiblings(assetIds, allAssets) {
  const parentIds = new Set()
  assetIds.forEach(id => {
    const index = allAssets.findIndex(asset => asset.id === id)
    const parentId = allAssets[index].parentId()
    if (parentId) parentIds.add(parentId)
  })
  allAssets.forEach(asset => {
    const parentId = asset.parentId()
    if (parentId && parentIds.has(parentId)) assetIds.add(asset.id)
  })
}

export function equalSets(as, bs) {
  if (!as && !bs) return true
  if ((!as && bs) || (!bs && as)) return false
  if (as.size !== bs.size) return false
  for (var a of as) if (!bs.has(a)) return false
  return true
}

// id - newly selected
// shift/meta - event modifiers
// items - array of {id}
// selectedIds - current set of selected ids
//
// returns newly selected set using standard UI selection behavior
export function selectId(id, shiftKey, metaKey, items, selectedIds) {
  let ids = null
  if (shiftKey) {
    const firstSelectedIndex = items.findIndex(
      item => selectedIds.has(item.id) || selectedIds.has(item.folderId),
    )
    if (firstSelectedIndex >= 0) {
      const selectedIndex = items.findIndex(
        f => id === f.id || id === f.folderId,
      )
      const minIndex = Math.min(selectedIndex, firstSelectedIndex)
      const maxIndex = Math.max(selectedIndex, firstSelectedIndex)
      const contigIds = items
        .slice(minIndex, maxIndex + 1)
        .map(item => item.folderId || item.id)
      ids = new Set(contigIds)
    } else {
      ids = new Set([id])
    }
  } else if (metaKey) {
    ids = new Set(selectedIds)
    ids[ids.has(id) ? 'delete' : 'add'](id)
  } else {
    // single click of a single selected folder should deselect
    if (selectedIds && selectedIds.size === 1 && selectedIds.has(id)) {
      ids = new Set()
    } else {
      ids = new Set([id])
    }
  }
  return ids
}

// Parse a string into a list of variable names, e.g.: 'foo %{bar} %{bam}' returns ['bar', 'bam']
// If template syntax changes, see also FieldTemplate.js
export function parseVariables(template) {
  return template.match(/%{[a-zA-Z0-9.|]*}/g)
}

// Replace the variables in the string template with values
export function replaceVariables(template, values) {
  if (!values) return template
  let str = template
  Object.keys(values).forEach(key => {
    const s = key.replace(/\|/g, '\\|')
    const re = new RegExp('\\%{' + s + '}', 'g')
    str = str.replace(re, values[key])
  })
  return str
}

export function valuesForFields(vars, asset) {
  const values = {}
  if (!vars || !vars.length) return values
  vars.forEach(re => {
    const key = re.slice(2, -1)
    const fields = key.split('|')
    let v
    for (let i = 0; i < fields.length; ++i) {
      const field = fields[i]
      v = asset.rawValue(field)
      if (v) break
    }
    if (v) values[key] = v
  })
  return values
}

export function fieldsForVariables(vars) {
  if (!vars || !vars.length) return []
  const fields = []
  vars.forEach(re => {
    const key = re.slice(2, -1)
    const args = key.split('|')
    args.forEach(field => fields.push(field))
  })
  return fields
}

/* ----------------------------------------------------------------------
Execute a sequence of promises, with a max limit
on the number of promises in flight at once.

'data' is an array containing the data needed to make each promise
  each element of 'data' is passed to 'mkPromiseFn'
'mkPromiseFn' is a callback function that generates a promise
  called once per item in 'data', passed the single datum, takes only that 1 param
'optNumInflight' is an OPTIONAL number specifying the number of inflight promises
  negative optNumInflight == #data/n (percentage), e.g. -1 for no limit, -2 for n/2, etc...
  default optNumInflight == sqrt(data.length)
'optProgressFn' is an OPTIONAL callback that is called once for every completed promise
and passed the number of completed items

Returns a promise that resolves when all promises in the queue resolve,
or rejects when the first promise in the queue rejects,
just like Promise.all()

Resolves with an array of the results, in the same order as 'data'
Rejects with the first error that occurs
*/
export function makePromiseQueue(
  data,
  mkPromiseFn,
  optNumInflight,
  optProgressFn,
) {
  return new Promise((resolve, reject) => {
    const n = data.length
    optNumInflight = optNumInflight || Math.round(Math.sqrt(n))
    if (optNumInflight < 0) optNumInflight = n / Math.abs(optNumInflight)
    optNumInflight = Math.max(1, Math.min(n, optNumInflight))

    let dataResults = []
    let nextDataToProcess = 0
    let totalFinished = 0

    let start = idx => {
      nextDataToProcess++
      mkPromiseFn(data[idx])
        .then(results => {
          totalFinished++
          dataResults[idx] = results
          if (optProgressFn) optProgressFn(totalFinished, n)
          if (totalFinished >= n) resolve(dataResults)
          if (nextDataToProcess < n) start(nextDataToProcess)
        })
        .catch(err => reject(err))
    }

    for (var i = 0; i < optNumInflight; i++) start(i)
  })
}

/* ----------------------------------------------------------------------
Return a promise that resolves after the given number of milliseconds
*/
export function makeDelayPromise(msToWait, optResolveVal) {
  return new Promise(resolve =>
    setTimeout(_ => resolve(optResolveVal), msToWait),
  )
}

/* ----------------------------------------------------------------------
Return a promise that times out & rejects after the given number of milliseconds
optRejectVal is optional, the value to pass to reject()
https://www.promisejs.org/patterns/
*/
export function makeTimeoutPromise(promise, msToWait, optRejectVal) {
  var rejectVal = optRejectVal !== undefined ? optRejectVal : 'timeout'
  return Promise.race([
    promise,
    makeDelayPromise(msToWait).then(_ => Promise.reject(rejectVal)),
  ])
}

function normalizeStringByCaseAndWhitespace(string) {
  const whitespace = /\s/gi
  return string
    .trim()
    .toLowerCase()
    .replace(whitespace, ' ')
}

/* ----------------------------------------------------------------------
Looks at an array of values, and attempts to deduplicate values where the
only differnce is casing or whitespace
*/
export function deduplicateStringsByCaseAndWhitespace(strings) {
  return strings.reduce((accumulator, string) => {
    const normalizedSuggestText = normalizeStringByCaseAndWhitespace(string)
    const isNormalizedValueDuplicated = accumulator.some(deduplicatedString => {
      return (
        normalizeStringByCaseAndWhitespace(deduplicatedString) ===
        normalizedSuggestText
      )
    })
    if (!isNormalizedValueDuplicated) {
      accumulator.push(string)
    }
    return accumulator
  }, [])
}

/* ---------------------------------------------------------------------- */
export class PubSub {
  topics = {}

  subscribe = (topic, fn) => {
    if (!topic || !fn) return
    if (!(topic in this.topics)) this.topics[topic] = []
    this.topics[topic].push(fn)
  }

  on = this.subscribe

  unsubscribe = (topic, fn) => {
    if (!topic) return
    if (!fn) {
      delete this.topics[topic]
    } else {
      let fns = this.topics[topic]
      if (!fns) return
      const index = fns.indexOf(fn)
      if (index !== -1) fns.splice(index, 1)
    }
  }

  off = this.unsubscribe

  publish = (topic, ...data) => {
    if (!topic) return
    const fns = this.topics[topic]
    if (!fns) return
    fns.forEach(fn => fn(...data))
  }
}
