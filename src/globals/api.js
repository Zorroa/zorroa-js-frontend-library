
//
// This is a space for functions we will expose
// to the javascript global window, for use by
// Selenium tests or other procedural drivers
//

window.zorroa = {}

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
