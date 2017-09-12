import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import JSONTree from 'react-json-tree'
import classnames from 'classnames'

import { hideModal, lightbarFieldTemplate, thumbFieldTemplate, dragFieldTemplate, uxLevel, monochrome } from '../../actions/appActions'
import { saveUserSettings, changePassword } from '../../actions/authAction'
import { archivistInfo, archivistHealth, archivistMetrics, archivistSetting } from '../../actions/archivistAction'
import User from '../../models/User'
import { DropboxAuthenticator } from '../Import/DropboxAuthenticator'
import { BoxAuthenticator } from '../Import/BoxAuthenticator'
import { GDriveAuthenticator } from '../Import/GDriveAuthenticator'
import { defaultThumbFieldTemplate, defaultLightbarFieldTemplate } from '../../reducers/appReducer'

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
    settings: PropTypes.object,
    actions: PropTypes.object,
    uxLevel: PropTypes.number,
    monochrome: PropTypes.bool,
    userSettings: PropTypes.object.isRequired,
    lightbarFieldTemplate: PropTypes.string,
    thumbFieldTemplate: PropTypes.string,
    dragFieldTemplate: PropTypes.string
  }

  componentDidMount () {
    this.props.actions.archivistInfo()
    this.props.actions.archivistHealth()
    this.props.actions.archivistMetrics()
    this.props.actions.archivistSetting('archivist.export.dragTemplate')
  }

  dismiss = (event) => {
    const { onDismiss } = this.props
    if (onDismiss) onDismiss(event)
    this.props.actions.hideModal()
  }

  reset = (event) => {
    this.props.actions.thumbFieldTemplate(defaultThumbFieldTemplate)
    this.props.actions.lightbarFieldTemplate(defaultLightbarFieldTemplate)
    this.props.actions.dragFieldTemplate(this.defaultDragTemplate())
    this.props.actions.saveUserSettings(this.props.user, {})
    .then(_ => window.location.reload())

    // TODO: remove the reload
    // This reload is a hack, currently needed to update the user's preferences
    // when the user hits "Reset User Preferences"
    // To fix it, we need to de-dupe the properties in app & app.userSettings
    // Some code that writes to userSettings isn't watching userSettings for updates.
    // We should probably also ensure that all settings have an explicit default
    // value in app.userSettings.<setting> (appReducer.js)
  }

  changePassword = (event) => {
    this.props.actions.changePassword(true)
    this.dismiss()
  }

  changeThumbFieldTemplate = (event) => {
    const thumbFieldTemplate = event.target.value
    this.props.actions.thumbFieldTemplate(thumbFieldTemplate)
    this.props.actions.saveUserSettings(this.props.user, { ...this.props.userSettings, thumbFieldTemplate })
  }

  changeLightbarFieldTemplate = (event) => {
    const lightbarFieldTemplate = event.target.value
    this.props.actions.lightbarFieldTemplate(lightbarFieldTemplate)
    this.props.actions.saveUserSettings(this.props.user, { ...this.props.userSettings, lightbarFieldTemplate })
  }

  changeDragFieldTemplate = (event) => {
    const dragFieldTemplate = event.target.value
    this.props.actions.dragFieldTemplate(dragFieldTemplate)
    this.props.actions.saveUserSettings(this.props.user, { ...this.props.userSettings, dragFieldTemplate })
  }

  defaultDragTemplate = () => {
    const { settings } = this.props
    const dragTemplateSetting = settings && settings['archivist.export.dragTemplate']
    return dragTemplateSetting && dragTemplateSetting.currentValue
  }

  resetDragFieldTemplate = (event) => {
    const { actions, user, userSettings } = this.props
    actions.dragFieldTemplate(this.defaultDragTemplate())
    actions.saveUserSettings(user, { ...userSettings, dragFieldTemplate: undefined })
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

  toggleMonochrome = (event) => {
    const monochrome = !this.props.monochrome
    this.props.actions.monochrome(monochrome)
    this.props.actions.saveUserSettings(this.props.user, { ...this.props.userSettings, monochrome })
  }

  toggleFilteredFolderCounts = (event) => {
    const showFilteredFolderCounts = !this.props.userSettings.showFilteredFolderCounts
    this.props.actions.saveUserSettings(this.props.user, { ...this.props.userSettings, showFilteredFolderCounts })
  }

  render () {
    const { user, info, health, metrics,
      lightbarFieldTemplate, thumbFieldTemplate, dragFieldTemplate,
      uxLevel, monochrome, userSettings } = this.props
    return (
      <div className="Preferences">
        <div className="Preferences-header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="Preferences-icon icon-cog"/>
            <div>Preferences</div>
          </div>
          <div onClick={this.dismiss} className="Preferences-close icon-cross"/>
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
            <div className="Preferences-checkboxes">
              <div className="Preferences-checkboxes-inner">
                <div className="Preferences-uxlevel Preferences-checkbox">
              <input type="checkbox" className="Preferences-uxlevel-input" checked={uxLevel > 0} onChange={this.toggleUXLevel}/>
                  <div className="Preferences-uxlevel-label Preferences-checkbox-label">Advanced Controls</div>
            </div>
                <div className="Preferences-monochrome Preferences-checkbox">
              <input type="checkbox" className="Preferences-monochrome-input" checked={monochrome} onChange={this.toggleMonochrome}/>
                  <div className="Preferences-monochrome-label Preferences-checkbox-label">Dark Theme</div>
                </div>
                <div className="Preferences-showFilteredFolderCounts Preferences-checkbox">
                  <input type="checkbox" className="Preferences-showFilteredFolderCounts-input" checked={userSettings.showFilteredFolderCounts} onChange={this.toggleFilteredFolderCounts}/>
                  <div className="Preferences-showFilteredFolderCounts-label Preferences-checkbox-label">Show folder search counts</div>
                </div>
              </div>
            </div>
            <div className="Preferences-field-template">
              <input type="text" className="Preferences-field-template-input" value={lightbarFieldTemplate || ''} onChange={this.changeLightbarFieldTemplate}/>
              <div className="Preferences-field-template-label">Lightbar Label</div>
            </div>
            <div className="Preferences-field-template">
              <input type="text" className="Preferences-field-template-input" value={thumbFieldTemplate || ''} onChange={this.changeThumbFieldTemplate}/>
              <div className="Preferences-field-template-label">Thumbnail Label</div>
            </div>
            <div className="Preferences-field-template">
              <input type="text" className="Preferences-field-template-input" style={{width: '240px'}} value={dragFieldTemplate || ''} onChange={this.changeDragFieldTemplate}/>
              <div className={classnames('Preferences-field-template-reset', {disabled: !this.defaultDragTemplate()})} onClick={this.resetDragFieldTemplate}>Reset</div>
              <div className="Preferences-field-template-label">Drag Template</div>
            </div>
            <div className="Preferences-cloud-reset">
              { DropboxAuthenticator.accessToken() && <button className="Preferences-reset" onClick={this.logoutDropbox}>Logout Dropbox</button> }
              { BoxAuthenticator.accessToken() && <button className="Preferences-reset" onClick={this.logoutBox}>Logout Box</button> }
              { GDriveAuthenticator.accessToken() && <button className="Preferences-reset" onClick={this.logoutGDrive}>Logout Google Drive</button> }
            </div>
            <div className="Preferences-account-reset">
              <button className="Preferences-reset" onClick={this.reset}>Reset Default User Settings</button>
              <button className="Preferences-reset" onClick={this.changePassword}>Change Password</button>
            </div>
          </div>
          <div className="Preferences-status">
            <div className='Preferences-build'>
              <div>CURATOR</div>
              <table cellSpacing={5}>
                <tbody>
                <tr><td className="Preferences-build-title">Version</td><td className="Preferences-build-value">{`${zvVersion}`}</td></tr>
                <tr><td className="Preferences-build-title">Build</td><td className="Preferences-build-value">{`${zvCount} (${zvCommit} ${zvBranch})`}</td></tr>
                <tr><td className="Preferences-build-title">Date</td><td className="Preferences-build-value">{`${zvDateStr}`}</td></tr>
                </tbody>
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
  settings: state.archivist.settings,
  uxLevel: state.app.uxLevel,
  monochrome: state.app.monochrome,
  userSettings: state.app.userSettings,
  lightbarFieldTemplate: state.app.lightbarFieldTemplate,
  thumbFieldTemplate: state.app.thumbFieldTemplate,
  dragFieldTemplate: state.app.dragFieldTemplate
}), dispatch => ({
  actions: bindActionCreators({
    saveUserSettings,
    changePassword,
    archivistInfo,
    archivistHealth,
    archivistMetrics,
    archivistSetting,
    hideModal,
    lightbarFieldTemplate,
    thumbFieldTemplate,
    dragFieldTemplate,
    uxLevel,
    monochrome
  }, dispatch)
}))(Preferences)
