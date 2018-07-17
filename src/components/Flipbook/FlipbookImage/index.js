import React, { Component, PropTypes } from 'react'
import ConnectedFlipbookImage from './ConnectedFlipbookImage'

import api from '../../../api'
import { PubSub } from '../../../services/jsUtil'
import Asset from '../../../models/Asset'

export default class FlipbookImageContainer extends Component {
  static propTypes = {
    clipParentId: PropTypes.string.isRequired,
    defaultFrame: PropTypes.instanceOf(Asset),
    autoPlay: PropTypes.bool,
    status: PropTypes.instanceOf(PubSub),
    shuttler: PropTypes.instanceOf(PubSub),
  }

  componentDidMount() {
    this.getFlipbook()
  }

  componentDidReceiveProps(prevProps) {
    if (prevProps.clipParentId !== this.props.clipParentId) {
      this.getFlipbook()
    }
  }

  getFlipbook() {
    this.setState({
      frames: [],
      isLoading: true,
      isError: false,
    })

    api.flipbook.get(this.props.clipParentId).then(
      frames => {
        this.setState({
          frames,
          isLoading: false,
          isError: false,
        })
      },
      () => {
        this.setState({
          frames: [],
          isError: true,
          isLoading: false,
        })
      },
    )
  }

  render() {
    return <ConnectedFlipbookImage {...this.state} {...this.props} />
  }
}
