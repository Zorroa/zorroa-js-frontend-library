import PropTypes from 'prop-types'
import React, { Component } from 'react'
import axios from 'axios'
import classnames from 'classnames'

import ProgressCircle from '../ProgressCircle'

export default class Image extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
  }

  state = {
    loadPercentage: 0,
    imageURI: '',
  }

  componentDidMount() {
    axios
      .get(this.props.url, {
        onDownloadProgress: progress => {
          this.calculateProgress(progress)
        },
        responseType: 'arraybuffer',
      })
      .then(res => {
        this.getImageURI(res)
      })
  }

  // calculates load progress of axios request for ProgressCircle
  calculateProgress(progress) {
    if (progress.total > 0) {
      const loadPercentage = Math.round(
        Math.min(progress.loaded / progress.total, 1) * 100,
      )
      this.setState({
        loadPercentage,
      })
    }
  }

  // encodes image to dataURI to minimize network requests
  getImageURI(res) {
    const encodedImage = Buffer.from(res.data, 'binary').toString('base64')
    const imageURI = `data:${res.headers[
      'content-type'
    ].toLowerCase()};base64,${encodedImage}`
    this.setState({ imageURI })
  }

  isLoaded() {
    return this.state.loadPercentage === 100
  }

  render() {
    const loadingClasses = classnames('ImageInspector__loading-status')
    return (
      <div
        className="ImageInspector"
        style={{ backgroundImage: `url(${this.state.imageURI})` }}>
        {!this.isLoaded() && (
          <div className={loadingClasses}>
            <ProgressCircle percentage={this.state.loadPercentage} />
          </div>
        )}
      </div>
    )
  }
}
