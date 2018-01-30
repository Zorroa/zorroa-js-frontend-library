import React, { Component, PropTypes } from 'react'
import { PubSub } from '../../services/jsUtil'
import Flipbook from './Flipbook'
import PanZoom from './PanZoom'
import {
  FLIPBOOK_FRAME_SELECTED
} from '../../constants/pubSubTopics'

export default class FlipbookViewer extends Component {
  static propTypes = {
    onError: PropTypes.func,
    fps: PropTypes.number,
    status: PropTypes.instanceOf(PubSub),
    shuttler: PropTypes.instanceOf(PubSub)
  }

  constructor (props) {
    super(props)

    this.shuttler = new PubSub()
    this.status = new PubSub()
    this.state = {
      currentFrame: 0
    }
  }

  componentDidMount () {
    this.status.on(FLIPBOOK_FRAME_SELECTED, currentFrame => {
      this.setState({ currentFrame })
    })
  }

  componentWillUnmount () {
    this.status.off()
    this.shuttler.off()
  }

  onError (error) {
    if (this.props.onError !== undefined) {
      this.props.onError(error)
    }
  }

  render () {
    return (
      <div className="FlipbookViewer">
        <div>
          Current frame: { this.state.currentFrame }
        </div>
        <PanZoom
          shuttler={this.shuttler}
        >
          <Flipbook
            fps={30}
            onError={this.onError}
            shuttler={this.shuttler}
            status={this.status}
          />
        </PanZoom>
      </div>
    )
  }
}
