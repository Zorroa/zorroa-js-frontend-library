//
// This is a space for functions we will expose
// to the javascript global window, for use by
// Selenium tests or other procedural drivers
//

window.zorroa = {}

// ----------------------------------------------------------------------

var requestSentCounter = 0
var requestReceivedCounter = 0

export function getRequestsSynced() {
  return requestSentCounter === requestReceivedCounter
}
window.zorroa.getRequestsSynced = getRequestsSynced

export function incRequestSentCounter() {
  requestSentCounter++
}
export function incRequestReceivedCounter() {
  requestReceivedCounter++
}

window.zorroa.incRequestSentCounter = incRequestSentCounter
window.zorroa.incRequestReceivedCounter = incRequestReceivedCounter
