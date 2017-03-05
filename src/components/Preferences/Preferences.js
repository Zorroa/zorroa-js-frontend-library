import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'
import { setPageSize } from '../../actions/assetsAction'
import { saveUserSettings } from '../../actions/authAction'
import { archivistInfo, archivistHealth, archivistMetrics } from '../../actions/archivistAction'
import { syntaxHighlight } from '../../services/jsUtil'
import User from '../../models/User'

class Preferences extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    onDismiss: PropTypes.func,
    info: PropTypes.object,
    health: PropTypes.object,
    metrics: PropTypes.object,
    pageSize: PropTypes.number,
    actions: PropTypes.object
  }

  componentDidMount () {
    this.props.actions.archivistInfo()
    this.props.actions.archivistHealth()
    this.props.actions.archivistMetrics()
  }

  dismiss = (event) => {
    const { onDismiss } = this.props
    if (onDismiss) onDismiss(event)
    this.props.actions.hideModal()
  }

  reset = (event) => {
    this.props.actions.saveUserSettings(this.props.user, {})
  }

  setPageSize = (event) => {
    const pageSize = Math.min(Math.max(100, event.target.value), 10000)
    this.props.actions.setPageSize(pageSize)
  }

  render () {
    const { user, pageSize, info, health, metrics } = this.props
    return (
      <div className="Preferences">
        <div className="Preferences-header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="Preferences-icon icon-cog"/>
            <div>Preferences</div>
          </div>
          <div onClick={this.dismiss} className="Preferences-close icon-cross2"/>
        </div>
        <div className="body">
          <div className="Preferences-user">
            <span>{user.username}</span>
            <span>{user.firstName} {user.lastName}</span>
            <span>{user.email}</span>
          </div>
          <div className="Preferences-curator flexCol">
            <div className="Preferences-curator-page-size">
              <span className="Preferences-page-size-label">Page Size</span>
              <input className="Preferences-page-size-text" size="5"
                     type="text" value={pageSize} onChange={this.setPageSize}/>
              <input className="Preferences-page-size-slider" type="range"
                     onChange={this.setPageSize}
                     value={pageSize} min="100" max="10000" step="100" />
            </div>
            <button className="Preferences-reset" onClick={this.reset}>Reset Defaults</button>
          </div>
          <div className="Preferences-status">
            <div className='Preferences-build'>
              <div>CURATOR</div>
              <table cellSpacing={5}>
                <tr><td className="Preferences-build-title">Version</td><td className="Preferences-build-value">{`${zvVersion}`}</td></tr>
                <tr><td className="Preferences-build-title">Build</td><td className="Preferences-build-value">{`${zvCount} (${zvCommit} ${zvBranch})`}</td></tr>
                <tr><td className="Preferences-build-title">Date</td><td className="Preferences-build-value">{`${zvDateStr}`}</td></tr>
              </table>
            </div>
            { info && <div className="Preferences-archivist">Archivisit Info<pre className="Preferences-pre">{JSON.stringify(info, null, 2)}</pre></div> }
            { health && <div className="Preferences-archivist">Archivisit Health<pre className="Preferences-pre">{JSON.stringify(health, null, 2)}</pre></div> }
            { metrics && <div className="Preferences-archivist">Archivisit Metrics<pre className="Preferences-pre">{JSON.stringify(metrics, null, 2)}</pre></div> }
          </div>
        </div>
        <div className="footer">
          <button onClick={this.dismiss}>Done</button>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  info: state.archivist.info,
  health: state.archivist.health,
  metrics: state.archivist.metrics,
  pageSize: state.assets.pageSize
}), dispatch => ({
  actions: bindActionCreators({
    setPageSize,
    saveUserSettings,
    archivistInfo,
    archivistHealth,
    archivistMetrics,
    hideModal
  }, dispatch)
}))(Preferences)
