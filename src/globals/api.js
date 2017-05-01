
//
// This is a space for functions we will expose
// to the javascript global window, for use by
// Selenium tests or other procedural drivers
//

window.zorroa = {}

// ----------------------------------------------------------------------

window.zorroa.jsErrors = []

// install a global error handler that logs all errors,
// so selenium tests can tell if we've had any errors.
// NOTE: this may not capture startup errors that occur before
// this code has run.

window.addEventListener('error', (err) => {
  return window.zorroa.jsErrors.push(err)
})

export function getNumErrors () { return window.zorroa.jsErrors.length }
export function getLastError () {
  return window.zorroa.jsErrors[window.zorroa.jsErrors.length - 1]
}
export function getLastErrorMessage () {
  const err = getLastError()
  return err && err.message
}
export function getError (n) { return window.zorroa.jsErrors[n] }
export function clearErrors () { window.zorroa.jsErrors = [] }

// Webdriver catches syncronous errors, make this async to better simulate a real error
export function testError () { requestAnimationFrame(_ => { window.nonexistant.property = 0 }) }

window.zorroa.getNumErrors = getNumErrors
window.zorroa.getLastError = getLastError
window.zorroa.getLastErrorMessage = getLastErrorMessage
window.zorroa.getError = getError
window.zorroa.clearErrors = clearErrors
window.zorroa.testError = testError

// ----------------------------------------------------------------------

var requestSentCounter = 0
var requestReceivedCounter = 0

export function getRequestsSynced () {
  // log(`getRequestsSynced ${requestSentCounter} ${requestReceivedCounter}`)
  return requestSentCounter === requestReceivedCounter
}
window.zorroa.getRequestsSynced = getRequestsSynced

export function incRequestSentCounter () { requestSentCounter++ }
export function incRequestReceivedCounter () { requestReceivedCounter++ }
export function getRequestSentCounter () { return requestSentCounter }
export function getRequestReceivedCounter () { return requestReceivedCounter }

window.zorroa.getRequestSentCounter = getRequestSentCounter
window.zorroa.getRequestReceivedCounter = getRequestReceivedCounter
window.zorroa.incRequestSentCounter = incRequestSentCounter
window.zorroa.incRequestReceivedCounter = incRequestReceivedCounter

// ----------------------------------------------------------------------

var selectionCounter = 0
export function getSelectionCounter () {
  return selectionCounter
}
export function setSelectionCounter (newSelectionCounter) {
  selectionCounter = newSelectionCounter
}
window.zorroa.getSelectionCounter = getSelectionCounter
window.zorroa.setSelectionCounter = setSelectionCounter

// ----------------------------------------------------------------------

var assetsCounter = 0
export function getAssetsCounter () {
  return assetsCounter
}
export function setAssetsCounter (newAssetsCounter) {
  assetsCounter = newAssetsCounter
}
window.zorroa.getAssetsCounter = getAssetsCounter
window.zorroa.setAssetsCounter = setAssetsCounter

// ----------------------------------------------------------------------

var seleniumTesting = false
export function getSeleniumTesting () {
  return seleniumTesting
}
export function setSeleniumTesting (_seleniumTesting) {
  seleniumTesting = !!_seleniumTesting
}
window.zorroa.getSeleniumTesting = getSeleniumTesting
window.zorroa.setSeleniumTesting = setSeleniumTesting

// ----------------------------------------------------------------------

var tableIsResizing = false
export function getTableIsResizing () {
  return tableIsResizing
}
export function setTableIsResizing (_tableIsResizing) {
  tableIsResizing = _tableIsResizing
}
window.zorroa.getTableIsResizing = getTableIsResizing
window.zorroa.setTableIsResizing = setTableIsResizing

// ----------------------------------------------------------------------

// I added these log functions to get some debug prints in the app to be visible
// when running Selenium tests, especially on Sauce servers
// Jest or something else appears to swallow all app side console.log() calls
// Call log(str) from app code to add a string to the log list
// Call getLog() from test code to retrieve the log list
// The log is emptied after every call to getLog()

var _log = []
export function getLog () {
  var ret = _log.slice()
  _log = []
  return ret
}
export function log (s) {
  _log.push(s)
}
window.zorroa.getLog = getLog
window.zorroa.log = log
