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
import { showModal } from '../../actions/appActions'
import { archivistBaseURL, saveUserSettings } from '../../actions/authAction'
import { selectAssetIds } from '../../actions/assetsAction'
import { similar } from '../../actions/racetrackAction'
import { weights } from '../Racetrack/SimilarHash'
import { equalSets } from '../../services/jsUtil'

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
    similar: PropTypes.shape({
      field: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.string).isRequired,
      ofsIds: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired,
    similarAssets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  }

  showPreferences = () => {
    const { user, actions } = this.props
    const width = '480px'
    const body = <Preferences user={user}/>
    actions.showModal({body, width})
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
    const { actions, selectedIds, similarAssets } = this.props
    if (!selectedIds || !selectedIds.size) return
    const selectedAssets = [...selectedIds].map(id => (similarAssets.find(asset => (asset.id === id)))).filter(asset => asset)
    const values = selectedAssets.map(asset => asset.rawValue(this.props.similar.field))
    const ofsIds = selectedAssets.map(asset => asset.closestProxy(256, 256).id)
    const similar = { values, ofsIds, weights: weights(ofsIds) }
    actions.similar(similar)
  }

  similarFields = () => {
    const { assetFields } = this.props
    if (!assetFields) return []
    let fields = []
    if (assetFields.string) fields = fields.concat(assetFields.string.filter(field => field.toLowerCase().startsWith('similar') && !field.match(/\.(raw|byte|point|bit)$/)))
    if (assetFields.hash) fields = fields.concat(assetFields.hash.filter(field => field.toLowerCase().startsWith('similar') && !field.match(/\.(raw|byte|point|bit)$/)))
    return fields
  }

  selectSimilarField = (field) => {
    const { actions } = this.props
    // FIXME: Need new hashes via similarAssets action (not state!), but need asset ids
    const values = []
    const ofsIds = []
    const similar = { ...this.props.similar, field, values, ofsIds }
    actions.similar(similar)
  }

  renderSimilar = () => {
    const { selectedIds, similar, similarAssets } = this.props

    const similarFields = this.similarFields()
    const displayName = (field) => {
      const name = field.replace(/\.(raw|byte|point|bit)$/, '').replace(/^.*\./, '')
      const remap = { resnet: 'image (RN)', tensorflow: 'image (TF)', hsv: 'color' }
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

    const nAssetsSelected = selectedIds ? selectedIds.size : 0
    const selectedAssets = nAssetsSelected && [...selectedIds].map(id => (similarAssets.find(asset => (asset.id === id)))).filter(asset => asset)
    const similarHashes = selectedAssets && selectedAssets.map(asset => asset.rawValue(this.props.similar.field))
    const similarActive = similar.field && similar.field.length > 0 && similar.values && similar.values.length > 0
    const similarValuesSelected = similarActive && similar.values && similarHashes && equalSets(new Set([...similar.values]), new Set([...similarHashes]))

    // Only enable similar button if selected assets have the right hash
    const canSortSimilar = similarFields && similarFields.length && selectedIds && selectedIds.size > 0 && similar.field && similar.field.length > 0 && !similarValuesSelected
    const sortSimilar = canSortSimilar ? this.sortSimilar : null

    return (
      <div className="Editbar-similar-section">
        <div className={classnames('Editbar-similar', { 'selected': similarActive, 'disabled': !canSortSimilar })}
             onClick={sortSimilar} title="Find similar assets">
          <div className={`Editbar-similar-icon ${displayIcon(similar.field)}`}/>
          Similar
        </div>
        { similarFields && similarFields.length > 1 && (
          <DropdownMenu>
            { similarFields.map(field => (
              <div className="Editbar-similar-menu-item" key={field} onClick={_ => this.selectSimilarField(field) } title={field}>
                <div className={`Editbar-similar-menu-item-selected${similar.field === field ? ' icon-check' : ''}`}/>
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
              <div className="header-menu-item header-menu-prefs" onClick={this.showPreferences}>
                Preferences...
              </div>
              { isDeveloper && (
                <div className="header-menu-item header-menu-dev" onClick={this.showDeveloper}>
                  Developer...
                </div>
              )}
              { isAdministrator && baseURL && (
                <a href={`${baseURL}/gui`} target="_blank" className="header-menu-item header-menu-admin">
                  Administrator...
                </a>
              )}
              { (isAdministrator || isDeveloper) && (
                <div className="header-menu-item header-menu-settings" onClick={this.showSettings}>
                  Settings...
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
  assetFields: state.assets && state.assets.fields,
  similar: state.racetrack.similar,
  similarAssets: state.assets.similar,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    showModal,
    selectAssetIds,
    similar,
    saveUserSettings
  }, dispatch)
}))(Header)
