export default class Widget {
  constructor ({id, type, sliver, isOpen}) {
    this.id = id || uniqueId()
    this.type = type
    this.sliver = sliver
    this.isOpen = isOpen
  }
}

// Acts like a static variable, returning increasing unique ids
var uniqueId = (function () {
  var id = 0                          // Private persistent value
  return function () { return ++id }  // Return and increment
})()                                  // Invoke to increment
