import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'

import User from '../../models/User'
import Asset from '../../models/Asset'
import Folders from '../Folders'
import FieldTemplate from '../FieldTemplate'
import { isolateAssetId } from '../../actions/assetsAction'
import { addAssetIdsToFolderId } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'

class Lightbar extends Component {
  static displayName = 'Lightbar'

  static propTypes = {
    showMetadata: PropTypes.bool.isRequired,
    onMetadata: PropTypes.func.isRequired,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    isolatedId: PropTypes.string,
    lightbarFieldTemplate: PropTypes.string,
    origin: PropTypes.string,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  state = {
    copyingLink: false,
    showFolders: false,
    addingToCollection: false
  }

  closeLightbox () {
    this.props.actions.isolateAssetId()
  }

  release = (event) => {
    this.forceUpdate()    // force redraw to clear isDragging CSS classnames
  }

  isolatedAssetURL () {
    const { isolatedId, assets, origin } = this.props
    const asset = assets.find(asset => (asset.id === isolatedId))
    if (!asset) return
    return asset.url(origin)
  }

  copyIsolatedAssetLink = () => {
    const text = this.isolatedAssetURL()
    if (!text) return
    copy(text)
    this.setState({ copyingLink: true })
    if (this.copyTimeout) clearTimeout(this.copyTimeout)
    this.copyTimeout = setTimeout(() => {
      this.setState({ copyingLink: false })
      this.copyTimeout = null
    }, 3000)
  }

  showFolders = (event) => {
    this.setState({ showFolders: !this.state.showFolders })
    event.preventDefault()
  }

  addToCollection = (folder, event) => {
    this.setState({ showFolders: false })
    const { isolatedId, actions } = this.props
    const ids = new Set([isolatedId])
    actions.addAssetIdsToFolderId(ids, folder.id)
    this.setState({ addingToCollection: `Added ${ids.size} to ${folder.name}` })
    if (this.addingTimeout) clearTimeout(this.addingTimout)
    this.addingTimeout = setTimeout(() => {
      this.setState({ addingToCollection: null })
      this.addingTimeout = null
    }, 3000)
  }

  render () {
    const { assets, isolatedId, user, showMetadata, onMetadata, lightbarFieldTemplate } = this.props
    const { actionWidth, lightbarHeight, copyingLink, showFolders, addingToCollection } = this.state
    const asset = assets.find(asset => (asset.id === isolatedId))
    return (
      <div className="Lightbar" style={{height: lightbarHeight}}>
        <div className="Lightbar-metadata">
          <div onClick={onMetadata} className={classnames('Lightbar-settings', 'icon-arrow-down', {isOpen: showMetadata})} />
          <FieldTemplate asset={asset} template={lightbarFieldTemplate} extensionOnLeft={true}/>
        </div>
        <div className="Lightbar-actions" style={{width: actionWidth, minWidth: actionWidth}}>
          <a href={this.isolatedAssetURL()} className='Lightbar-action' download={this.isolatedAssetURL()}>
            <span className='Lightbar-action-text'>Download</span>
            <i className='Lightbar-btn-icon icon-download2'/>
          </a>
          <div onClick={!copyingLink && this.copyIsolatedAssetLink} className='Lightbar-action'>
            <span className='Lightbar-action-text'>Get Link</span>
            <i className='Lightbar-btn-icon icon-link2'/>
            { copyingLink && <div className="Lightbar-performed-action">Copied URL to clipboard</div> }
          </div>
          <div onClick={this.showFolders} className='Lightbar-action'>
            <span className='Lightbar-action-text'>Add to Collection</span>
            <i className='Lightbar-btn-icon icon-chevron-down'/>
            { showFolders && (
              <div className="Lightbar-folders" onClick={e => { e.stopPropagation() }}>
                <Folders filterName="simple" onSelect={this.addToCollection}
                         filter={f => (!f.isDyhi() && !f.search && (f.childCount || f.canAddAssetIds(new Set([isolatedId]), assets, user)))} />
              </div>
            )}
            { addingToCollection && <div className="Lightbar-performed-action">{addingToCollection}</div> }
          </div>
          <div className="Lightbar-close icon-cross" onClick={this.closeLightbox.bind(this)} />
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  isolatedId: state.assets.isolatedId,
  lightbarFieldTemplate: state.app.lightbarFieldTemplate,
  origin: state.auth.origin,
  user: state.auth.user,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    isolateAssetId,
    addAssetIdsToFolderId,
    saveUserSettings
  }, dispatch)
}))(Lightbar)
