import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'

import Cloudproxy from '../../services/Cloudproxy'

const oses = ['linux', 'osx']
const urls = [
  'https://dl.zorroa.com/public/cloudproxy/zorroa-cloudproxy-linux.tgz',
  'https://dl.zorroa.com/public/cloudproxy/Gofer-v0.1.0.dmg',
]
const index =
  window.navigator.userAgent.indexOf('Mac') >= 0
    ? 1
    : window.navigator.userAgent.indexOf('Linux') >= 0 ? 0 : -1

export default class LocalCloudproxy extends Component {
  static propTypes = {
    onBack: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
  }

  state = {
    stats: null,
    downloaded: false,
  }

  cloudproxy = null

  componentWillMount() {
    this.cloudproxy = new Cloudproxy('localhost', this.props.onDone)
    this.cloudproxy.start()
  }

  componentWillUnmount() {
    if (this.cloudproxy) this.cloudproxy.stop()
  }

  download = event => {
    this.setState({ downloaded: true })
  }

  renderDownload() {
    return (
      <div>
        <div className="Import-title">
          <div className="Import-step">Step 2:</div>
          Download backgrounding tool
        </div>
        <div className="ImportCloudproxy-downloads">
          <div className="ImportCloudproxy-download" key={oses[index]}>
            <div className="ImportCloudproxy-script icon-script" />
            <a
              href={urls[index]}
              download
              className="Import-button"
              onClick={this.download}>
              Download {oses[index]} {index === 0 ? 'server' : 'app'}
            </a>
          </div>
        </div>
        <div className="ImportCloudproxy-upload-overflow">
          We'll show you how to{' '}
          {index === 0
            ? 'run the upload server'
            : 'install the backgrounding tool'}{' '}
          next...
        </div>
      </div>
    )
  }

  renderOSX() {
    return (
      <div className="CloudproxyInstructions-item-osx">
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">1.</div>
          <div className="CloudproxyInstructions-item-body code">
            Open the DMG file and copy the Gopher app to the Applications folder
          </div>
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">2.</div>
          <div className="CloudproxyInstructions-item-body code">
            Run the Gopher status bar application to start the background
            loader.
          </div>
        </div>
      </div>
    )
  }

  renderLinux() {
    return (
      <div className="CloudproxyInstructions-linux">
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">1.</div>
          <div className="CloudproxyInstructions-item-body code">
            {`tar xvzf <download-directory>/zorroa-cloudproxy-linux.tgz`}
          </div>
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">2.</div>
          <div className="CloudproxyInstructions-item-body code">
            {`zorroa-cloudproxy-linux/bin/cloudproxy -d`}
          </div>
        </div>
      </div>
    )
  }

  renderLocal() {
    const { onDone } = this.props
    const { stats } = this.state
    const disabled = !stats
    const label = stats ? 'Upload Files' : 'Waiting for Cloudproxy...'
    return (
      <div className="CloudproxyInstructions-local">
        <div className="Import-title">
          <div className="Import-step">Step 2:</div>
          Start the Cloudproxy uploading tool.
        </div>
        {index === 0 ? this.renderLinux() : this.renderOSX()}
        <div
          className={classnames('CloudproxyInstructions-done', { disabled })}
          onClick={!disabled && onDone}>
          {label}
        </div>
      </div>
    )
  }

  render() {
    const { onBack } = this.props
    const { downloaded } = this.state
    return (
      <div className="CloudproxyInstructions">
        <div className="Import-back" onClick={onBack}>
          <div
            className="icon-arrow-down"
            style={{ transform: 'rotate(90deg)' }}
          />
          Back
        </div>
        {downloaded ? this.renderLocal() : this.renderDownload()}
      </div>
    )
  }
}
