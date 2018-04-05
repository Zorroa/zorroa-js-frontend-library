import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import JSONTree from 'react-json-tree'
import classnames from 'classnames'

import {
  hideModal,
  lightbarFieldTemplate,
  thumbFieldTemplate,
  dragFieldTemplate,
  uxLevel,
  monochrome,
} from '../../actions/appActions'
import { saveUserSettings, changePassword } from '../../actions/authAction'
import {
  archivistInfo,
  archivistHealth,
  archivistMetrics,
  archivistSetting,
} from '../../actions/archivistAction'
import User from '../../models/User'
import { DropboxAuthenticator } from '../Import/DropboxAuthenticator'
import { BoxAuthenticator } from '../Import/BoxAuthenticator'
import { GDriveAuthenticator } from '../Import/GDriveAuthenticator'
import {
  defaultThumbFieldTemplate,
  defaultLightbarFieldTemplate,
} from '../../constants/defaultState'
import { FILTERED_COUNTS, FULL_COUNTS, NO_COUNTS } from '../Folders/Folders'
import DropdownMenu from '../DropdownMenu/DropdownMenu'
import './General.scss'

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
  base0F: '#be643c',
}

class General extends Component {
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
    dragFieldTemplate: PropTypes.string,
  }

  componentDidMount() {
    this.props.actions.archivistInfo()
    this.props.actions.archivistHealth()
    this.props.actions.archivistMetrics()
    this.props.actions.archivistSetting('curator.thumbnails.drag-template')
  }

  dismiss = event => {
    const { onDismiss } = this.props
    if (onDismiss) onDismiss(event)
    this.props.actions.hideModal()
  }

  reset = event => {
    this.props.actions.thumbFieldTemplate(defaultThumbFieldTemplate)
    this.props.actions.lightbarFieldTemplate(defaultLightbarFieldTemplate)
    this.props.actions.dragFieldTemplate(this.defaultDragTemplate())
    this.props.actions
      .saveUserSettings(this.props.user, {})
      .then(_ => window.location.reload())

    // TODO: remove the reload
    // This reload is a hack, currently needed to update the user's preferences
    // when the user hits "Reset User Preferences"
    // To fix it, we need to de-dupe the properties in app & app.userSettings
    // Some code that writes to userSettings isn't watching userSettings for updates.
    // We should probably also ensure that all settings have an explicit default
    // value in app.userSettings.<setting> (appReducer.js)
  }

  changePassword = event => {
    this.props.actions.changePassword(true)
    this.dismiss()
  }

  changeThumbFieldTemplate = event => {
    const thumbFieldTemplate = event.target.value
    this.props.actions.thumbFieldTemplate(thumbFieldTemplate)
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      thumbFieldTemplate,
    })
  }

  changeLightbarFieldTemplate = event => {
    const lightbarFieldTemplate = event.target.value
    this.props.actions.lightbarFieldTemplate(lightbarFieldTemplate)
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      lightbarFieldTemplate,
    })
  }

  changeDragFieldTemplate = event => {
    const dragFieldTemplate = event.target.value
    this.props.actions.dragFieldTemplate(dragFieldTemplate)
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      dragFieldTemplate,
    })
  }

  defaultDragTemplate = () => {
    const { settings } = this.props
    const dragTemplateSetting =
      settings && settings['curator.thumbnails.drag-template']
    return dragTemplateSetting && dragTemplateSetting.currentValue
  }

  resetDragFieldTemplate = event => {
    const { actions, user, userSettings } = this.props
    actions.dragFieldTemplate(this.defaultDragTemplate())
    actions.saveUserSettings(user, {
      ...userSettings,
      dragFieldTemplate: undefined,
    })
  }

  logoutDropbox = event => {
    DropboxAuthenticator.deauthorize()
    this.dismiss()
  }

  logoutBox = event => {
    BoxAuthenticator.deauthorize()
    this.dismiss()
  }

  logoutGDrive = event => {
    GDriveAuthenticator.deauthorize()
    this.dismiss()
  }

  toggleUXLevel = event => {
    const uxLevel = this.props.uxLevel === 0 ? 1 : 0
    this.props.actions.uxLevel(uxLevel)
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      uxLevel,
    })
  }

  toggleMonochrome = event => {
    const monochrome = !this.props.monochrome
    this.props.actions.monochrome(monochrome)
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      monochrome,
    })
  }

  toggleFastLightboxPanning = event => {
    if (!this.props.userSettings) return
    const fastLightboxPanning = event.checked
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      fastLightboxPanning,
    })
  }

  setFolderCounts = showFolderCounts => {
    this.props.actions.saveUserSettings(this.props.user, {
      ...this.props.userSettings,
      showFolderCounts,
    })
  }

  render() {
    const {
      user,
      info,
      health,
      metrics,
      lightbarFieldTemplate,
      thumbFieldTemplate,
      dragFieldTemplate,
      uxLevel,
      monochrome,
      userSettings,
    } = this.props
    return (
      <div className="General">
        <div className="body">
          <div className="General-user">
            <div className="General-user-header">
              <span>{user.username}</span>
              <span>
                {user.firstName} {user.lastName}
              </span>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="General-curator flexCol">
            <div className="General-checkboxes">
              <div className="General-checkboxes-inner">
                <div className="General-uxlevel General-checkbox">
                  <input
                    type="checkbox"
                    className="General-uxlevel-input"
                    checked={uxLevel > 0}
                    onChange={this.toggleUXLevel}
                  />
                  <div className="General-uxlevel-label General-checkbox-label">
                    Advanced Controls
                  </div>
                </div>
                <div className="General-monochrome General-checkbox">
                  <input
                    type="checkbox"
                    className="General-monochrome-input"
                    checked={monochrome}
                    onChange={this.toggleMonochrome}
                  />
                  <div className="General-monochrome-label General-checkbox-label">
                    Dark Theme
                  </div>
                </div>
                <div className="General-monochrome General-checkbox">
                  <input
                    type="checkbox"
                    className="General-monochrome-input"
                    checked={userSettings.fastLightboxPanning}
                    onChange={this.toggleFastLightboxPanning}
                  />
                  <div className="General-monochrome-label General-checkbox-label">
                    Fast lightbox panning
                  </div>
                </div>
                <div className="General-showFolderCounts">
                  <div className="General-showFolderCounts-label">
                    Show folder counts:{' '}
                  </div>
                  <DropdownMenu
                    label={userSettings.showFolderCounts || FILTERED_COUNTS}>
                    <div
                      className="General-showFolderCounts-menuitem"
                      onClick={_ => this.setFolderCounts(FILTERED_COUNTS)}>
                      {FILTERED_COUNTS}
                    </div>
                    <div
                      className="General-showFolderCounts-menuitem"
                      onClick={_ => this.setFolderCounts(FULL_COUNTS)}>
                      {FULL_COUNTS}
                    </div>
                    <div
                      className="General-showFolderCounts-menuitem"
                      onClick={_ => this.setFolderCounts(NO_COUNTS)}>
                      {NO_COUNTS}
                    </div>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <div className="General-field-template">
              <input
                type="text"
                className="General-field-template-input"
                value={lightbarFieldTemplate || ''}
                onChange={this.changeLightbarFieldTemplate}
              />
              <div className="General-field-template-label">Lightbar Label</div>
            </div>
            <div className="General-field-template">
              <input
                type="text"
                className="General-field-template-input"
                value={thumbFieldTemplate || ''}
                onChange={this.changeThumbFieldTemplate}
              />
              <div className="General-field-template-label">
                Thumbnail Label
              </div>
            </div>
            <div className="General-field-template">
              <input
                type="text"
                className="General-field-template-input"
                style={{ width: '240px' }}
                value={dragFieldTemplate || ''}
                onChange={this.changeDragFieldTemplate}
              />
              <div
                className={classnames('General-field-template-reset', {
                  disabled: !this.defaultDragTemplate(),
                })}
                onClick={this.resetDragFieldTemplate}>
                Reset
              </div>
              <div className="General-field-template-label">Drag Template</div>
            </div>
            <div className="General-cloud-reset">
              {DropboxAuthenticator.accessToken() && (
                <button className="General-reset" onClick={this.logoutDropbox}>
                  Logout Dropbox
                </button>
              )}
              {BoxAuthenticator.accessToken() && (
                <button className="General-reset" onClick={this.logoutBox}>
                  Logout Box
                </button>
              )}
              {GDriveAuthenticator.accessToken() && (
                <button className="General-reset" onClick={this.logoutGDrive}>
                  Logout Google Drive
                </button>
              )}
            </div>
            <div className="General-account-reset">
              <button className="General-reset" onClick={this.reset}>
                Reset Default User Settings
              </button>
              <button className="General-reset" onClick={this.changePassword}>
                Change Password
              </button>
            </div>
          </div>
          <div className="General-status">
            <div className="General-build">
              <div>CURATOR</div>
              <table cellSpacing={5}>
                <tbody>
                  <tr>
                    <td className="General-build-title">Version</td>
                    <td className="General-build-value">{`${zvVersion}`}</td>
                  </tr>
                  <tr>
                    <td className="General-build-title">Build</td>
                    <td className="General-build-value">{`${zvCount} (${zvCommit} ${zvBranch})`}</td>
                  </tr>
                  <tr>
                    <td className="General-build-title">Date</td>
                    <td className="General-build-value">{`${zvDateStr}`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {info && (
              <div className="General-archivist">
                Archivisit Info<JSONTree
                  data={info}
                  theme={theme}
                  invertTheme
                  hideRoot
                />
              </div>
            )}
            {health && (
              <div className="General-archivist">
                Archivisit Health<JSONTree
                  data={health}
                  theme={theme}
                  invertTheme
                  hideRoot
                />
              </div>
            )}
            {metrics && (
              <div className="General-archivist">
                Archivisit Metrics<JSONTree
                  data={metrics}
                  theme={theme}
                  invertTheme
                  hideRoot
                />
              </div>
            )}
          </div>
        </div>
        <div className="footer">
          <button onClick={this.dismiss}>Done</button>
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    info: state.archivist.info,
    health: state.archivist.health,
    metrics: state.archivist.metrics,
    settings: state.archivist.settings,
    uxLevel: state.app.uxLevel,
    monochrome: state.app.monochrome,
    userSettings: state.app.userSettings,
    lightbarFieldTemplate: state.app.lightbarFieldTemplate,
    thumbFieldTemplate: state.app.thumbFieldTemplate,
    dragFieldTemplate: state.app.dragFieldTemplate,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
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
        monochrome,
      },
      dispatch,
    ),
  }),
)(General)
