import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'

import User from '../../models/User'
import Asset from '../../models/Asset'
import Folders from '../Folders'
import DisplayOptions from '../DisplayOptions'
import TableField from '../Table/TableField'
import Resizer from '../../services/Resizer'
import { updateLightbarFields, showModal } from '../../actions/appActions'
import { flatDisplayPropertiesForFields } from '../../models/DisplayProperties'
import { isolateAssetId } from '../../actions/assetsAction'
import { addAssetIdsToFolderId } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'

class Lightbar extends Component {
  static displayName = 'Lightbar'

  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    isolatedId: PropTypes.string,
    selectedPageIds: PropTypes.instanceOf(Set),
    showPages: PropTypes.bool,
    pages: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    lightbarFields: PropTypes.arrayOf(PropTypes.string),
    protocol: PropTypes.string,
    host: PropTypes.string,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  state = {
    columnWidth: 300,       // Fixed widths, to be draggable
    actionWidth: 425,
    lightbarHeight: 60,
    copyingLink: false,
    showFolders: false,
    addingToCollection: false
  }

  componentWillMount () {
    this.resizer = new Resizer()
    this.componentWillReceiveProps(this.props)
  }

  componentWillUnmount () {
    this.resizer.release()  // safe, removes listener on async redraw
  }

  componentWillReceiveProps (props) {
    const actionColWidth = 185
    const actionRowWidth = 425
    const actionRowHeight = 130
    if (props.lightbarFields.length > 3) {
      if (this.state.actionWidth > actionColWidth) {
        this.setState({ actionWidth: actionColWidth, lightbarHeight: actionRowHeight })
      }
    } else {
      if (this.state.actionWidth < actionRowWidth) {
        this.setState({ actionWidth: actionRowWidth })
      }
    }
  }

  closeLightbox () {
    this.props.actions.isolateAssetId()
  }

  showDisplayOptions = () => {
    const width = '75%'
    const body = <DisplayOptions title='Lightbar Display Options'
                                 singleSelection={false}
                                 fieldTypes={null}
                                 selectedFields={this.props.lightbarFields}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
  }

  updateDisplayOptions = (event, state) => {
    const lightbarFields = state.checkedNamespaces
    console.log('Update lightbar display options to:\n' + JSON.stringify(lightbarFields))
    this.props.actions.updateLightbarFields(lightbarFields)
    const { user, userSettings } = this.props
    const settings = { ...userSettings, lightbarFields }
    this.props.actions.saveUserSettings(user, settings)
  }

  resizeLightbar = (resizeX, resizeY) => {
    this.setState({ lightbarHeight: Math.max(60, resizeY) })
  }

  resizeColumn = (resizeX, resizeY) => {
    this.setState({ columnWidth: Math.max(60, resizeX) })
  }

  resizeAction = (resizeX, resizeY) => {
    this.setState({ actionWidth: Math.max(60, resizeX) })
  }

  release = (event) => {
    this.forceUpdate()    // force redraw to clear isDragging CSS classnames
  }

  isolatedAssetURL () {
    const { isolatedId, assets, host, protocol } = this.props
    const asset = assets.find(asset => (asset.id === isolatedId))
    if (!asset) return
    return asset.url(protocol, host)
  }

  copyIsolatedAssetLink = () => {
    const text = this.isolatedAssetURL()
    if (!text) return
    copy(text)
    console.log('Copied to clipboard: ' + text)
    this.setState({ copyingLink: true })
    if (this.copyTimeout) clearTimeout(this.copyTimout)
    this.copyTimout = setTimeout(() => {
      this.setState({ copyingLink: false })
      this.copyTimout = null
    }, 3000)
  }

  showFolders = (event) => {
    this.setState({ showFolders: !this.state.showFolders })
    event.preventDefault()
  }

  addToCollection = (folder, event) => {
    this.setState({ showFolders: false })
    const { showPages, isolatedId, selectedPageIds, actions } = this.props
    const ids = showPages ? selectedPageIds : new Set([isolatedId])
    actions.addAssetIdsToFolderId(ids, folder.id)
    this.setState({ addingToCollection: `Added ${ids.size} to ${folder.name}` })
    if (this.addingTimeout) clearTimeout(this.addingTimout)
    this.addingTimeout = setTimeout(() => {
      this.setState({ addingToCollection: null })
      this.addingTimeout = null
    }, 3000)
  }

  renderField ({title, field, displayProperties, asset}) {
    const { columnWidth } = this.state

    // Section title, contains object starting with title field
    if (displayProperties.children && displayProperties.children.length) {
      if (!field.includes('.')) return null   // Skip top-level section titles
      return (
        <div key={`${title}-${field}`} className="Lightbar-attr" style={{width: columnWidth}}>
          <div className="Lightbar-attr-title">
            { title }
          </div>
          <div className="Lightbar-attr-bar"/>
        </div>
      )
    }

    // Field value
    const titleWidth = columnWidth / 3
    const fieldWidth = 2 * titleWidth
    return (
      <div key={field} className="Lightbar-attr" style={{width: columnWidth}}>
        <div className="Lightbar-attr-field" style={{width: titleWidth}}>
          {title}
        </div>
        <div className="Lightbar-attr-separator"/>
        <TableField asset={asset} field={field} width={fieldWidth}/>
      </div>
    )
  }

  render () {
    const { lightbarFields, assets, isolatedId, showPages, selectedPageIds, user, pages } = this.props
    const { columnWidth, actionWidth, lightbarHeight, copyingLink, showFolders, addingToCollection } = this.state
    const isDraggingColumn = this.resizer.active && this.resizer.onMove === this.resizeColumn
    const isDraggingAction = this.resizer.active && this.resizer.onMove === this.resizeAction
    const asset = assets.find(asset => (asset.id === isolatedId)) || pages.find(asset => (asset.id === isolatedId))
    const titleFields = asset && lightbarFields && flatDisplayPropertiesForFields(lightbarFields, asset)
    const nselected = selectedPageIds && selectedPageIds.size
    const isAddToCollectionDisabled = showPages && !nselected
    return (
      <div className="Lightbar" style={{height: lightbarHeight}}>
        <button onClick={this.showDisplayOptions} className="Lightbar-settings icon-cog" />
        <div className="Lightbar-metadata">
          { titleFields && titleFields.map(tf => this.renderField({...tf, asset})) }
          <div className="Lightbar-column-resizers">
            { /* TRICKY: N columns, with accumulated scaling */
              [1, 2, 3, 4, 5, 6, 7].map(k => (
              <div key={k} className={classnames('Lightbar-column-resizer', {isDragging: isDraggingColumn})}
                   style={{left: k * columnWidth - 2.5}}
                   onMouseDown={event => this.resizer.capture(this.resizeColumn, this.release, columnWidth, 0, 1.0 / k)} />
            ))}
          </div>
        </div>
        <div className="Lightbar-actions" style={{width: actionWidth}}>
          <a href={this.isolatedAssetURL()} className='Lightbar-action' download={this.isolatedAssetURL()}>
            <span className='Lightbar-action-text'>Download</span>
            <i className='Lightbar-btn-icon icon-download2'/>
          </a>
          <div onClick={!copyingLink && this.copyIsolatedAssetLink} className='Lightbar-action'>
            <span className='Lightbar-action-text'>Get Link</span>
            <i className='Lightbar-btn-icon icon-link2'/>
            { copyingLink && <div className="Lightbar-performed-action">Copied URL to clipboard</div> }
          </div>
          <div onClick={!isAddToCollectionDisabled && this.showFolders}
               className={classnames('Lightbar-action', {isDisabled: isAddToCollectionDisabled})}>
            <span className='Lightbar-action-text'>Add to Collection</span>
            <i className='Lightbar-btn-icon icon-chevron-down'/>
            { showFolders && (
              <div className="Lightbar-folders" onClick={e => { e.stopPropagation() }}>
                <Folders filterName="simple" onSelect={this.addToCollection}
                         filter={f => (!f.isDyhi() && !f.search && (f.childCount || f.canAddAssetIds(selectedPageIds, assets, user)))} />
              </div>
            )}
            { addingToCollection && <div className="Lightbar-performed-action">{addingToCollection}</div> }
          </div>
          <div onMouseDown={event => this.resizer.capture(this.resizeAction, this.release, actionWidth, 0, -1 /* left */)}
               className={classnames('Lightbar-action-resizer', {isDragging: isDraggingAction})} />
        </div>
        <button className="Lightbar-close icon-cross2" onClick={this.closeLightbox.bind(this)} />
        <div onMouseDown={event => this.resizer.capture(this.resizeLightbar, this.release, 0, lightbarHeight)}
             className="Lightbar-resizer" />
      </div>
    )
  }
}

export default connect(state => ({
  assets: state.assets.all,
  isolatedId: state.assets.isolatedId,
  showPages: state.app.showPages,
  pages: state.assets.pages,
  selectedPageIds: state.assets.selectedPageIds,
  lightbarFields: state.app.lightbarFields,
  protocol: state.auth.protocol,
  host: state.auth.host,
  user: state.auth.user,
  userSettings: state.app.userSettings
}), dispatch => ({
  actions: bindActionCreators({
    isolateAssetId,
    updateLightbarFields,
    addAssetIdsToFolderId,
    saveUserSettings,
    showModal }, dispatch)
}))(Lightbar)
