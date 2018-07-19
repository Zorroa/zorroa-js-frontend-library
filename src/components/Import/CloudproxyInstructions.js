import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class CloudproxyInstructions extends Component {
  static propTypes = {
    local: PropTypes.bool.isRequired,
    os: PropTypes.string.isRequired,
    onBack: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
  }

  state = {
    server: 'localhost',
    downloads: '~/Downloads',
    stats: null,
  }

  changeCloudproxyServer = event => {
    const server = event.target.value
    this.cloudproxy.initialize(server)
    this.setState({ server })
  }

  renderServer() {
    const { os } = this.props
    const { server } = this.state
    return (
      <div className="CloudproxyInstructions-server">
        <div className="CloudproxyInstructions-server-name">
          <div className="CloudproxyInstructions-server-name-label">
            Server name:
          </div>
          <input
            className="CloudproxyInstructions-server-input"
            type="text"
            value={server}
            onChange={this.changeCloudproxyServer}
          />
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">1.</div>
          <div className="CloudproxyInstructions-item-body code">
            {`scp zorroa-cloudproxy-${os}.tgz {server}:/var/tmp`}
          </div>
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">2.</div>
          <div className="CloudproxyInstructions-item-body code">
            ssh username@{server}
          </div>
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">3.</div>
          <div className="CloudproxyInstructions-item-body code">
            /var/tmp/zorroa-cloudproxy/bin/cloudproxy -d
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { onBack, onDone } = this.props
    return (
      <div className="CloudproxyInstructions">
        <div className="Import-back" onClick={onBack}>
          <div
            className="icon-arrow-down"
            style={{ transform: 'rotate(90deg)' }}
          />
          Back
        </div>
        <div className="Import-title">
          <div className="Import-step">Step 3:</div>
          Start the Cloudproxy script and select files.
        </div>
        {this.renderServer()}
        <div className="CloudproxyInstructions-done" onClick={onDone}>
          Open Cloudproxy
        </div>
      </div>
    )
  }
}
