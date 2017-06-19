import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import JSONTree from 'react-json-tree'

import { hideModal, lightbarFieldTemplate, thumbFieldTemplate, uxLevel } from '../../actions/appActions'
import { saveUserSettings, changePassword } from '../../actions/authAction'
import { archivistInfo, archivistHealth, archivistMetrics } from '../../actions/archivistAction'
import User from '../../models/User'
import { DropboxAuthenticator } from '../Import/DropboxAuthenticator'
import { BoxAuthenticator } from '../Import/BoxAuthenticator'
import { GDriveAuthenticator } from '../Import/GDriveAuthenticator'

const theme = {
  scheme: 'bright',
  author: 'chris kempson (http://chriskempson.com)',
  base00: '#000000',
  base01: '#303030',
  base02: '#505050',
  base03: '#b0b0b0',
  base04: '#d0d0d0',
  base05: '#e0e0e0',
  base06: '#f5f5f5',
  base07: '#ffffff',
  base08: '#fb0120',
  base09: '#fc6d24',
  base0A: '#fda331',
  base0B: '#a1c659',
  base0C: '#76c7b7',
  base0D: '#6fb3d2',
  base0E: '#d381c3',
  base0F: '#be643c'
}

class Preferences extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    onDismiss: PropTypes.func,
    info: PropTypes.object,
    health: PropTypes.object,
    metrics: PropTypes.object,
    actions: PropTypes.object,
    uxLevel: PropTypes.number,
    userSettings: PropTypes.object.isRequired,
    lightbarFieldTemplate: PropTypes.string,
    thumbFieldTemplate: PropTypes.string
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

  changePassword = (event) => {
    this.props.actions.changePassword(true)
    this.dismiss()
  }

  changeThumbFieldTemplate = (event) => {
    this.props.actions.thumbFieldTemplate(event.target.value)
  }

  changeLightbarFieldTemplate = (event) => {
    this.props.actions.lightbarFieldTemplate(event.target.value)
  }

  logoutDropbox = (event) => {
    DropboxAuthenticator.deauthorize()
    this.dismiss()
  }

  logoutBox = (event) => {
    BoxAuthenticator.deauthorize()
    this.dismiss()
  }

  logoutGDrive = (event) => {
    GDriveAuthenticator.deauthorize()
    this.dismiss()
  }

  toggleUXLevel = (event) => {
    const uxLevel = this.props.uxLevel === 0 ? 1 : 0
    this.props.actions.uxLevel(uxLevel)
    this.props.actions.saveUserSettings(this.props.user, { ...this.props.userSettings, uxLevel })
  }

  render () {
    const { user, info, health, metrics, lightbarFieldTemplate, thumbFieldTemplate, uxLevel } = this.props
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
            <div className="Preferences-user-header">
              <span>{user.username}</span>
              <span>{user.firstName} {user.lastName}</span>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="Preferences-curator flexCol">
            <button className="Preferences-reset" onClick={this.reset}>Reset Default User Settings</button>
            <button className="Preferences-reset" onClick={this.changePassword}>Change Password</button>
            <div className="Preferences-uxlevel">
              <input type="checkbox" className="Preferences-uxlevel-input" checked={uxLevel > 0} onClick={this.toggleUXLevel}/>
              <div className="Preferences-uxlevel-label">Advanced Controls</div>
            </div>
            <div className="Preferences-field-template">
              <input type="text" className="Preferences-field-template-input" value={lightbarFieldTemplate} onChange={this.changeLightbarFieldTemplate}/>
              <div className="Preferences-field-template-label">Lightbar Label</div>
            </div>
            <div className="Preferences-field-template">
              <input type="text" className="Preferences-field-template-input" value={thumbFieldTemplate} onChange={this.changeThumbFieldTemplate}/>
              <div className="Preferences-field-template-label">Thumbnail Label</div>
            </div>
            { DropboxAuthenticator.accessToken() && <button className="Preferences-reset" onClick={this.logoutDropbox}>Logout Dropbox</button> }
            { BoxAuthenticator.accessToken() && <button className="Preferences-reset" onClick={this.logoutBox}>Logout Box</button> }
            { GDriveAuthenticator.accessToken() && <button className="Preferences-reset" onClick={this.logoutGDrive}>Logout Google Drive</button> }
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
            { info && <div className="Preferences-archivist">Archivisit Info<JSONTree data={info} theme={theme} invertTheme hideRoot/></div> }
            { health && <div className="Preferences-archivist">Archivisit Health<JSONTree data={health} theme={theme} invertTheme hideRoot/></div> }
            { metrics && <div className="Preferences-archivist">Archivisit Metrics<JSONTree data={metrics} theme={theme} invertTheme hideRoot/></div> }
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
  uxLevel: state.app.uxLevel,
  userSettings: state.app.userSettings,
  lightbarFieldTemplate: state.app.lightbarFieldTemplate,
  thumbFieldTemplate: state.app.thumbFieldTemplate
}), dispatch => ({
  actions: bindActionCreators({
    saveUserSettings,
    changePassword,
    archivistInfo,
    archivistHealth,
    archivistMetrics,
    hideModal,
    lightbarFieldTemplate,
    thumbFieldTemplate,
    uxLevel
  }, dispatch)
}))(Preferences)
