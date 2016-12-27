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
//       componentWillMount () { this.resizer = new Resizer() }
//
//   - Release resizer in unmount to safely handle full redraws:
//       componentWillUmount () { this.resizer.release() }
//
//   - Add onMouseDown to a draggable component:
//       <div onMouseDown={e => this.resizer.capture(this.resize, w)} />
//
//   - Implement the resize callback, typically adjust a state variable:
//       resize = (w) => { this.setState({ resizedWidth: w }) }
//
//   - Use adjusted state variable in a style call to set width:
//       render () { <div style={{width: this.state.resizeWidth}} />

export default class Resizer {
  constructor () {
    // Not sure why the new auto-bind-member syntax didn't work here...
    this.move = this.move.bind(this)
    this.release = this.release.bind(this)
  }

  capture = (onMove, onRelease, x, y, scaleX, scaleY) => {
    this.onMove = onMove
    this.onRelease = onRelease
    this.startX = x
    this.startY = y
    this.scaleX = scaleX === undefined ? 1 : scaleX
    this.scaleY = scaleY === undefined ? 1 : scaleY
    window.addEventListener('mousemove', this.move)
    window.addEventListener('mouseup', this.release)
  }

  move (event) {
    if (!this.onMove) return
    if (!this.startPageX) {
      this.startPageX = event.pageX
      this.startPageY = event.pageY
    }
    const x = this.startX + this.scaleX * (event.pageX - this.startPageX)
    const y = this.startY + this.scaleY * (event.pageY - this.startPageY)
    this.onMove(x, y)
  }

  release (event) {
    this.onMove = null
    this.startX = null
    this.startY = null
    this.scaleX = 0
    this.scaleY = 0
    this.startPageX = null
    this.startPageY = null
    window.removeEventListener('mousemove', this.move)
    window.removeEventListener('mouseup', this.release)
    this.onRelease && this.onRelease(event)
    this.onRelease = null
  }
}
