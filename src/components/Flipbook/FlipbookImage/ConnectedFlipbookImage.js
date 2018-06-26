import { connect } from 'react-redux'
import FlipbookImage from './FlipbookImage'

export default connect(state => ({
  fps: state.app.flipbookFps,
  origin: state.auth.origin,
  shouldLoop: state.app.shouldLoop,
  shouldHold: state.app.shouldHold,
}))(FlipbookImage)
