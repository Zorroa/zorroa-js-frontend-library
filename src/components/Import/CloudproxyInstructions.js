import React, { PropTypes, Component } from 'react'

export default class CloudproxyInstructions extends Component {
  static propTypes = {
    local: PropTypes.bool.isRequired,
    onBack: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired
  }

  state = {
    server: 'localhost'
  }

  renderLocal () {
    return (
      <div className="CloudproxyInstructions-local">
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">1.</div>
          <div className="CloudproxyInstructions-item-body">
            Start the Terminal application
          </div>
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">2.</div>
          <div className="CloudproxyInstructions-item-body code">
            tar xvzf ~/Downloads/zorroa-cloudproxy-osx.tgz
          </div>
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">3.</div>
          <div className="CloudproxyInstructions-item-body code">
            zorroa-cloudproxy/bin/cloudproxy -d
          </div>
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">4.</div>
          <a href="http://localhost:8090" target="_blank" className="CloudproxyInstructions-item-body">
            Navigate to Cloudproxy
          </a>
          <div className="CloudproxyInstructions-item-body">
            and select folders & files.
          </div>
        </div>
      </div>
    )
  }

  renderServer () {
    const { server } = this.state
    return (
      <div className="CloudproxyInstructions-server">
        <div className="CloudproxyInstructions-server-name">
          <div className="CloudproxyInstructions-server-name-label">Server name:</div>
          <input className="CloudproxyInstructions-server-input"
                 type="text" value={server} onChange={e => this.setState({server: e.target.value})}/>
        </div>
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">1.</div>
          <div className="CloudproxyInstructions-item-body code">
            scp zorroa-cloudproxy-linux.tgz {server}:/var/tmp
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
        <div className="CloudproxyInstructions-item">
          <div className="CloudproxyInstructions-item-title">4.</div>
          <a href={`http://${server}:8090`} target="_blank" className="CloudproxyInstructions-item-body">
            Navigate to Cloudproxy
          </a>
          <div className="CloudproxyInstructions-item-body">
            and select folders & files.
          </div>
        </div>
      </div>
    )
  }

  render () {
    const { local, onBack, onDone } = this.props
    return (
      <div className="CloudproxyInstructions">
        <div className="Import-back" onClick={onBack}>
          <div className="icon-chevron-right" style={{transform: 'rotate(180deg)'}}/>
          Back
        </div>
        <div className="Import-title">
          <div className="Import-step">Step 3:</div>
          Start the Cloudproxy script and select files.
        </div>
        { local ? this.renderLocal() : this.renderServer() }
        <div className="CloudproxyInstructions-done" onClick={onDone}>
          Done
        </div>
      </div>
    )
  }
}
