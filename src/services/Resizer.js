// Track resizing events using mouse listeners.
// Returns adjusted initial position/dim in onMove callback.
// Handles both horizontal and vertical resizing, with an optional
// scale for each axis to handle moving the left or top borders (-1).
// Scale can also handle multiple columns/rows (see Lightbar).
//
// Note that motion changes are not stored in Redux state.
//
// Works around lack of mouse coords in Firefox drag events.
// Works if mouse leaves browser window.
//
// Typical usage to resize the width of a <div>:
//   - Create a Resizer member var, not in component or Redux state:
//       componentWillMount = () => { this.resizer = new Resizer() }
//
//   - Release resizer in unmount to safely handle full redraws:
//       componentWillUmount = () => { this.resizer.release() }
//
//   - Add onMouseDown to a resizeable component:
//       <div onMouseDown={() => this.resizer.capture(this.resizeUpdate, this.resizeEnd)} />
//
//   - Implement the resize callback, typically adjust a state variable:
//       resize = (w, h) => { this.setState({ resizedWidth: w }) }
//
//   - Use adjusted state variable in a style call to set width:
//       render = () => { <div style={{width: this.state.resizeWidth}} />

import * as api from '../globals/api.js'

export default class Resizer {
  constructor () {
    this.reset()
  }

  reset = () => {
    this.onMove = null
    this.onRelease = null
    this.startPageX = 0
    this.startPageY = 0
    this.startX = 0
    this.startY = 0
    this.scaleX = 1
    this.scaleY = 1
    this.active = false
  }

  capture = (onMove, onRelease, startX, startY, optScaleX, optScaleY) => {
    this.active = true
    this.onMove = onMove
    this.onRelease = onRelease
    this.startX = startX
    this.startY = startY
    this.scaleX = optScaleX === undefined ? 1 : optScaleX
    this.scaleY = optScaleY === undefined ? 1 : optScaleY
    window.addEventListener('mousemove', this.move)
    window.addEventListener('mouseup', this.release)

    api.log(`[resizer.capture] ${startX} ${startY} ${Date.now()}`)
  }

  move = (event) => {
    if (!this.startPageX && !this.startPageY) {
      this.startPageX = event.pageX
      this.startPageY = event.pageY
    }
    if (!this.onMove) return
    const x = this.startX + this.scaleX * (event.pageX - this.startPageX)
    const y = this.startY + this.scaleY * (event.pageY - this.startPageY)
    this.onMove(x, y)
    api.log(`[resizer.move] page:(${event.pageX}, ${event.pageY}) ${Date.now()}`)
  }

  release = (event) => {
    this.active = false
    window.removeEventListener('mousemove', this.move)
    window.removeEventListener('mouseup', this.release)
    if (this.onRelease) this.onRelease()
    this.reset()
    api.log(`[resizer.release] page:(${event.pageX}, ${event.pageY}) ${Date.now()}`)
  }
}
