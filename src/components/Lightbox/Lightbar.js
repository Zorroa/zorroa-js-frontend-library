import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'
import copy from 'copy-to-clipboard'
import ReactDOMServer from 'react-dom/server'

import User from '../../models/User'
import Asset, { minimalUniqueFieldTitle } from '../../models/Asset'
import Folders from '../Folders'
import DisplayOptions from '../DisplayOptions'
import TableField from '../Table/TableField'
import Resizer from '../../services/Resizer'
import { updateLightbarFields, showModal } from '../../actions/appActions'
import { flatDisplayPropertiesForFields } from '../../models/DisplayProperties'
import { isolateAssetId } from '../../actions/assetsAction'
import { addAssetIdsToFolderId } from '../../actions/folderAction'
import { saveUserSettings } from '../../actions/authAction'
import { unCamelCase } from '../../services/jsUtil'

class Lightbar extends Component {
  static displayName = 'Lightbar'

  static propTypes = {
    showMetadata: PropTypes.bool.isRequired,
    onMetadata: PropTypes.func.isRequired,
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    isolatedId: PropTypes.string,
    selectedPageIds: PropTypes.instanceOf(Set),
    showPages: PropTypes.bool,
    pages: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    lightbarFields: PropTypes.arrayOf(PropTypes.string),
    origin: PropTypes.string,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.object
  }

  state = {
    columnWidths: [240],       // Fixed widths, to be draggable
    titleWidths: [70],
    actionWidth: 425,
    lightbarHeight: 60,
    copyingLink: false,
    showFolders: false,
    addingToCollection: false
  }

  componentWillMount () {
    this.resizer = new Resizer()
  }

  componentWillUnmount () {
    this.resizer.release()  // safe, removes listener on async redraw
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
    this.props.actions.updateLightbarFields(lightbarFields)
    const { user, userSettings } = this.props
    const settings = { ...userSettings, lightbarFields }
    this.props.actions.saveUserSettings(user, settings)
  }

  resizeLightbar = (resizeX, resizeY) => {
    const lightbarHeight = Math.max(60, resizeY)
    const actionWidth = lightbarHeight < 125 ? 425 : 185
    this.setState({ lightbarHeight, actionWidth })
  }

  resizeColumn (index, width) {
    const columnWidths = [...this.state.columnWidths]
    columnWidths[index] = Math.max(60, width)
    this.setState({ columnWidths })
  }

  resizeTitle (index, width) {
    const titleWidths = [...this.state.titleWidths]
    const min = 40
    const max = this.state.columnWidths[index] - min
    titleWidths[index] = Math.min(max, Math.max(min, width))
    this.setState({ titleWidths })
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

  renderFields (titleFields, asset) {
    const fields = titleFields.filter(field => {
      const children = field.displayProperties.children
      return !children || !children.length
    })
    const titleWidths = [...this.state.titleWidths]
    let titleWidth = titleWidths[0]
    const columnWidths = [...this.state.columnWidths]
    let columnWidth = columnWidths[0]
    const maxColumnHeight = this.state.lightbarHeight - 20
    const columns = []
    let columnKids = []
    let columnHeight = 0
    var test = document.getElementById('Table-cell-test')
    if (!test) return
    const isDraggingColumn = this.resizer.active
    const addColumn = (index) => {
      const column = (
        <div className="Lightbar-column" style={{width: columnWidth}} key={columns.length}>
          {columnKids}
          <div className={classnames('Lightbar-title-resizer', {isDragging: isDraggingColumn})} key="title-resizer"
               style={{left: `${titleWidth}px`}}
               onMouseDown={event => this.resizer.capture(this.resizeTitle.bind(this, index), this.release, titleWidths[index])} />
          <div className={classnames('Lightbar-column-resizer', {isDragging: isDraggingColumn})} key="col-resizer"
               onMouseDown={event => this.resizer.capture(this.resizeColumn.bind(this, index), this.release, columnWidths[index])} />
        </div>
      )
      columns.push(column)
    }

    const fieldNames = fields.map(field => field.field)
    const addField = (params) => {
      const { tails, head } = minimalUniqueFieldTitle(params.field, fieldNames, 0)
      const tail = tails && tails.join(' \u203A ') + ' \u203A '
      return (
        <div className="Lightbar-field" key={params.field}>
          <div className="Lightbar-field-title" style={{minWidth: titleWidth, maxWidth: titleWidth}}>
            { tail && <div className="Lightbar-field-title-tail">{tail}</div> }
            { head && <div className="Lightbar-field-title-head">{unCamelCase(head)}</div> }
          </div>
          <TableField {...params}/>
        </div>
      )
    }

    // Fill the columns
    fields.forEach(field => {
      let fieldWidth = columnWidth - titleWidth
      const params = { width: fieldWidth, asset, field: field.field, isOpen: true, dark: true }
      test.innerHTML = ReactDOMServer.renderToString(addField(params))
      const rect = test.getBoundingClientRect()
      const height = rect.height
      if (columnHeight + height <= maxColumnHeight) {
        const isOpen = height <= maxColumnHeight
        columnKids.push(addField({...params, isOpen}))
        columnHeight += height
      } else {
        addColumn(columns.length)
        if (columnWidths.length <= columns.length) {
          columnWidths.push(columnWidths[columnWidths.length - 1])
          titleWidths.push(titleWidths[titleWidths.length - 1])
        }
        columnWidth = columnWidths[columns.length]
        titleWidth = titleWidths[columns.length]
        fieldWidth = columnWidth - titleWidth
        columnHeight = height
        params.width = fieldWidth
        const isOpen = height <= maxColumnHeight
        columnKids = [addField({...params, isOpen})]
      }
    })

    if (columnKids.length) addColumn()    // Last column
    if (this.state.columnWidths.length !== columnWidths.length) this.setState({columnWidths, titleWidths})
    return columns
  }

  render () {
    const { lightbarFields, assets, isolatedId, showPages, selectedPageIds, user, pages, showMetadata, onMetadata } = this.props
    const { actionWidth, lightbarHeight, copyingLink, showFolders, addingToCollection } = this.state
    const asset = assets.find(asset => (asset.id === isolatedId)) || pages.find(asset => (asset.id === isolatedId))
    const titleFields = asset && lightbarFields && flatDisplayPropertiesForFields(lightbarFields, asset)
    const nselected = selectedPageIds && selectedPageIds.size
    const isAddToCollectionDisabled = showPages && !nselected
    return (
      <div className="Lightbar" style={{height: lightbarHeight}}>
        <div onClick={this.showDisplayOptions} className="Lightbar-settings icon-cog" />
        <div onClick={onMetadata} className={classnames('Lightbar-settings', 'icon-chevron-down', {isOpen: showMetadata})} />
        <div className="Lightbar-metadata">
          { this.renderFields(titleFields, asset) }
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
                         filter={f => (!f.isDyhi() && !f.search && (f.childCount || f.canAddAssetIds(showPages ? selectedPageIds : new Set([isolatedId]), assets, user)))} />
              </div>
            )}
            { addingToCollection && <div className="Lightbar-performed-action">{addingToCollection}</div> }
          </div>
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
  origin: state.auth.origin,
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
