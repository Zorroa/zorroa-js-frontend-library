import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classnames from 'classnames'

import User from '../../models/User'
import Asset from '../../models/Asset'
import Logo from '../../components/Logo'
import DropdownMenu from '../../components/DropdownMenu'
import Preferences from '../../components/Preferences'
import Feedback from '../../components/Feedback'
import Developer from '../../components/Developer'
import Settings from '../../components/Settings'
import AssetCounter from '../Assets/AssetCounter'
import { showModal, hideModal, dialogAlertPromise } from '../../actions/appActions'
import { archivistBaseURL, saveUserSettings } from '../../actions/authAction'
import { selectAssetIds, findSimilarFields, assetsForIds } from '../../actions/assetsAction'
import { resetRacetrackWidgets } from '../../actions/racetrackAction'
import { equalSets } from '../../services/jsUtil'
import { createSimilarityWidget } from '../../models/Widget'

class Header extends Component {
  static propTypes = {
    sync: PropTypes.bool.isRequired,
    user: PropTypes.instanceOf(User).isRequired,
    isDeveloper: PropTypes.bool,
    isAdministrator: PropTypes.bool,
    monochrome: PropTypes.bool,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    selectedIds: PropTypes.object,
    totalCount: PropTypes.number,
    loadedCount: PropTypes.number,
    assetFields: PropTypes.object,
    similarFields: PropTypes.instanceOf(Set),
    similarMinScore: PropTypes.object,
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    similarField: '',
    isSelectedHashValid: false
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.assetFields && !this.props.assetFields) {
      this.props.actions.findSimilarFields(nextProps.assetFields)
    }
    let similarField = this.state.similarField
    if (!similarField && nextProps.similarFields && nextProps.similarFields.size) {
      similarField = [...nextProps.similarFields][0]
      this.lastSelectedIds = null
      this.setState({similarField})
    }
    this.updateIsSelectedHashValid(nextProps.selectedIds, similarField)
  }

  updateIsSelectedHashValid (selectedIds, similarField) {
    if (similarField && selectedIds && !equalSets(this.lastSelectedIds, selectedIds)) {
      this.lastSelectedIds = new Set(selectedIds)
      if (selectedIds.size) {
        assetsForIds(selectedIds, [similarField])
          .then(selectedAssets => {
            const selectedHashes = selectedAssets.map(asset => asset.rawValue(similarField)).filter(hash => hash && hash.length)
            const isSelectedHashValid = selectedHashes.length > 0
            this.setState({isSelectedHashValid})
          })
          .catch(error => {
            console.log('Error getting selected asset hashes: ' + error)
          })
      } else {
        const isSelectedHashValid = false
        this.setState({isSelectedHashValid})
      }
    } else {
      const isSelectedHashValid = false
      this.setState({isSelectedHashValid})
    }
  }

  showPreferences = (activePane) => {
    const { user, actions } = this.props
    const width = '90vw'
    const body = <Preferences activePane={activePane} user={user}/>
    actions.showModal({
      body,
      width,
      onModalUnderlayClick: actions.hideModal
    })
  }

  showFeedback = () => {
    const { user, actions } = this.props
    const width = '460px'
    const body = <Feedback user={user}/>
    actions.showModal({body, width})
  }

  showDeveloper = () => {
    const width = '800px'
    const body = <Developer/>
    this.props.actions.showModal({body, width})
  }

  showSettings = () => {
    const width = '75vw'
    const body = <Settings/>
    this.props.actions.showModal({body, width})
  }

  deselectAll = () => {
    this.props.actions.selectAssetIds(null)
  }

  sortSimilar = () => {
    const { similarField } = this.state
    if (!similarField) return

    const { selectedIds, similarMinScore } = this.props
    const widgets = [...this.props.widgets]
    const index = widgets && widgets.findIndex(widget => widget.field === similarField)
    const oldWidget = widgets && index >= 0 && widgets[index]
    const isEnabled = true
    const isPinned = false
    const minScore = similarMinScore[similarField] || 75
    const oldFilter = oldWidget && oldWidget.sliver && oldWidget.sliver.filter && oldWidget.sliver.filter.similarity[oldWidget.field]
    const oldHashes = oldFilter && oldFilter.hashes
    const hashes = [...selectedIds].map(id => {
      const oldHash = oldHashes && oldHashes.find(hash => hash.hash === id)
      if (oldHash) return oldHash
      return { hash: id, weight: 1 }
    })
    const widget = createSimilarityWidget(similarField, null, hashes, minScore, isEnabled, isPinned)
    if (index < 0) {
      widgets.push(widget)
    } else {
      widgets[index] = widget
    }
    this.props.actions.resetRacetrackWidgets(widgets)
  }

  selectSimilarField = (similarField) => {
    if (similarField !== this.state.similarField) {
      this.lastSelectedIds = null
      this.updateIsSelectedHashValid(this.props.selectedIds, similarField)
      this.setState({similarField})
    }
  }

  renderSimilar = () => {
    const { similarField, isSelectedHashValid } = this.state
    const { selectedIds, similarFields, widgets } = this.props

    const displayName = (field) => {
      const name = field.replace(/\.(raw|byte|point|bit)$/, '').replace(/^.*\./, '')
      const remap = { mxnet: 'image (MX)', resnet: 'image (RN)', tensorflow: 'image (TF)', rgb: 'color (RGB)', hsv: 'color (HSV)', lab: 'color (LAB)', hsl: 'color (HSL)' }
      const rname = remap[name.toLowerCase()]
      if (rname) return rname
      return name
    }

    const displayIcon = (field) => {
      if (!field || !field.length) return ''
      const name = displayName(field).toLowerCase()
      if (name.startsWith('image')) return 'icon-picture2'
      if (name.startsWith('color')) return 'icon-eyedropper'
      if (name.includes('hsv') || name.includes('hsl') || name.includes('lab') || name.includes('rgb') || name.includes('color')) return 'icon-eyedropper'
      if (name.includes('face')) return 'icon-group'
      return 'icon-similarity'
    }

    const similarActive = similarField && selectedIds
    const widget = widgets && widgets.find(widget => widget.field === similarField)
    const filter = similarField && widget && widget.sliver && widget.sliver.filter && widget.sliver.filter.similarity && widget.sliver.filter.similarity[similarField]
    const hashes = filter && filter.hashes
    const similarAssetIds = hashes ? hashes.map(hash => hash.hash) : []
    const similarValuesSelected = similarActive && selectedIds && equalSets(new Set(similarAssetIds), selectedIds)

    // Only enable similar button if selected assets have the right hash
    const canSortSimilar = similarFields && similarFields.size && similarField && similarField.length > 0 && !similarValuesSelected && isSelectedHashValid
    const sortSimilar = canSortSimilar ? this.sortSimilar : null

    return (
      <div className="Editbar-similar-section">
        <div className={classnames('Editbar-similar', { 'selected': similarActive, 'disabled': !canSortSimilar })}
             onClick={sortSimilar} title="Find similar assets">
          <div className={`Editbar-similar-icon ${displayIcon(similarField)}`}/>
          Similar
        </div>
        { similarFields && similarFields.size > 1 && (
          <DropdownMenu>
            { [...similarFields].map(field => (
              <div className="Editbar-similar-menu-item" key={field} onClick={_ => this.selectSimilarField(field) } title={field}>
                <div className={`Editbar-similar-menu-item-selected${similarField === field ? ' icon-check' : ''}`}/>
                <div className={`Editbar-similar-icon ${displayIcon(field)}`}/>
                <div className="Editbar-similar-menu-item-label">{ displayName(field) }</div>
              </div>
            ))}
          </DropdownMenu>
        )}
      </div>
    )
  }

  render () {
    const { sync, user, isDeveloper, isAdministrator, totalCount, loadedCount, selectedIds, monochrome } = this.props
    const baseURL = archivistBaseURL()

    const loader = require('./loader-rolling.svg')
    const syncer = !isDeveloper || sync ? <div className="Header-loading sync"/> : <img className="Header-loading" src={loader}/>

    const nAssetsSelected = selectedIds ? selectedIds.size : 0
    const disabledSelected = !selectedIds || !selectedIds.size

    return (
      <nav className="header flexOff flexCenter fullWidth">
        <Link to="/" className='header-logo'><Logo dark={monochrome}/></Link>
        { syncer }
        <div className="header-asset-counter">
          <AssetCounter total={totalCount} collapsed={0} loaded={loadedCount || 0}/>
        </div>
        <div className={classnames('Editbar-selected', {disabled: disabledSelected})}>
          { nAssetsSelected ? `${nAssetsSelected} assets selected` : '' }
          { nAssetsSelected ? (<div onClick={this.deselectAll} className={classnames('Editbar-cancel', 'icon-cancel-circle', {disabledSelected})}/>) : null }
        </div>
        <div className="flexOn"/>
        { this.renderSimilar() }
        <div className="header-menu-bar fullHeight flexCenter">
          <div className="header-menu">
            <DropdownMenu label="Help">
              <a href="https://zorroa.com/help-center/" target="_blank" className="header-menu-item" >Tutorials</a>
              <a href="https://zorroa.com/help-center/faqs" target="_blank" className="header-menu-item" >FAQ</a>
              <a href="https://zorroa.com/help-center/release-notes/" target="_blank" className="header-menu-item" >Release Notes</a>
              <div className="header-menu-item header-menu-feedback" onClick={this.showFeedback}>
                Send Feedback
              </div>
            </DropdownMenu>
          </div>
          <div className="header-menu header-menu-user icon-zorroa-person-06">
            <DropdownMenu label={(<div>{user.username}</div>)}>
              <div className="header-menu-item header-menu-prefs" onClick={() => { this.showPreferences('general') }}>
                Preferences...
              </div>
              { isDeveloper && (
                <div className="header-menu-item header-menu-dev" onClick={this.showDeveloper}>
                  Developer...
                </div>
              )}
              { isAdministrator && baseURL && (
                <a href={`${baseURL}/admin/gui`} target="_blank" className="header-menu-item header-menu-admin">
                  Administrator...
                </a>
              )}
              { isAdministrator && (
                <div className="header-menu-item header-menu-settings" onClick={() => { this.showPreferences('user') }}>
                  User Admin...
                </div>
              )}
              { (isAdministrator || isDeveloper) && (
                <div className="header-menu-item header-menu-settings" onClick={this.showSettings}>
                  Archivist Settings...
                </div>
              )}
              <Link className="header-menu-item header-menu-logout" to="/signout">Logout</Link>
            </DropdownMenu>
          </div>
        </div>

        {/* this is stupid/ugly, but neede to keep sidebar & header logo widths in sync */}
        <div className='header-padding' style={{width: '22px'}}/>
      </nav>
    )
  }
}

export default connect(state => ({
  sync: state.auth.sync,
  user: state.auth.user,
  isDeveloper: state.auth.isDeveloper,
  isAdministrator: state.auth.isAdministrator,
  monochrome: state.app.monochrome,
  assets: state.assets.all,
  selectedIds: state.assets.selectedIds,
  totalCount: state.assets.totalCount,
  loadedCount: state.assets.loadedCount,
  assetFields: state.assets.fields,
  similarFields: state.assets.similarFields,
  similarMinScore: state.racetrack.similarMinScore,
  userSettings: state.app.userSettings,
  widgets: state.racetrack.widgets
}), dispatch => ({
  actions: bindActionCreators({
    showModal,
    hideModal,
    selectAssetIds,
    saveUserSettings,
    dialogAlertPromise,
    findSimilarFields,
    resetRacetrackWidgets
  }, dispatch)
}))(Header)
