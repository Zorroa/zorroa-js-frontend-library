import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Modal from '../Modal'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import CreateExport from '../Folders/CreateExport'
import DisplayOptions from '../DisplayOptions'
import TableField from '../Table/TableField'
import Resizer from '../../services/Resizer'
import { exportAssets } from '../../actions/jobActions'
import { updateLightbarFields, showModal } from '../../actions/appActions'
import { unCamelCase } from '../../services/jsUtil'

class Lightbar extends Component {
  static displayName = 'Lightbar'

  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    isolatedId: PropTypes.string,
    lightbarFields: PropTypes.arrayOf(PropTypes.string),
    modal: PropTypes.object,
    actions: PropTypes.object
  }

  static contextTypes = {
    router: PropTypes.object
  }

  state = {
    columnWidth: 300,       // Fixed widths, to be draggable
    actionWidth: 100,
    lightbarHeight: 60
  }

  componentWillMount () {
    this.resizer = new Resizer()
  }

  componentWillUnmount () {
    this.resizer.release()  // safe, removes listener on async redraw
  }

  closeLightbox () {
    this.context.router.push('/')
  }

  showDisplayOptions = () => {
    const width = '75%'
    const body = <DisplayOptions title='Lightbar Display Options'
                                 syncLabel={null}
                                 singleSelection={false}
                                 fieldTypes={null}
                                 selectedFields={this.props.lightbarFields}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
  }

  updateDisplayOptions = (event, state) => {
    console.log('Update lightbar display options to:\n' + JSON.stringify(state.checkedNamespaces))
    this.props.actions.updateLightbarFields(state.checkedNamespaces)
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

  exportAssets = () => {
    const width = '460px'
    const body = <CreateExport onCreate={this.createExport} />
    this.props.actions.showModal({body, width})
  }

  createExport = (event, name, exportImages, exportMetadata) => {
    const { isolatedId } = this.props
    const search = new AssetSearch({ filter: new AssetFilter({ terms: {'_id': [isolatedId]} }) })
    this.props.actions.exportAssets(name, search)
  }

  lastField (field) {
    return field.split('.').pop()
  }

  render () {
    const { assets, isolatedId, lightbarFields, modal } = this.props
    const { columnWidth, actionWidth, lightbarHeight } = this.state
    if (!assets || !isolatedId) return null
    const asset = assets.find(asset => (asset.id === isolatedId))
    const titleWidth = columnWidth / 3
    const fieldWidth = 2 * titleWidth
    const isDraggingColumn = this.resizer.onMove === this.resizeColumn
    const isDraggingAction = this.resizer.onMove === this.resizeAction
    return (
      <div className="Lightbar" style={{height: lightbarHeight}}>
        { modal && <Modal {...modal} /> }
        <button onClick={this.showDisplayOptions} className="Lightbar-settings icon-cog" />
        <div className="Lightbar-metadata">
          { lightbarFields && lightbarFields.map(field => (
            <div key={field} className="Lightbar-attr" style={{width: columnWidth}}>
              <div className="Lightbar-attr-field" style={{width: titleWidth}}>
                {unCamelCase(this.lastField(field))}
              </div>
              <div className="Lightbar-attr-separator"/>
              <TableField asset={asset} field={field} width={fieldWidth}/>
            </div>
          ))}
          <div className="Lightbar-column-resizers">
            { /* TRICKY: N columns, with accumulated scaling */ [1, 2, 3, 4].map(k => (
              <div key={k} className={classnames('Lightbar-column-resizer', {isDragging: isDraggingColumn})}
                   style={{left: k * columnWidth}}
                   onMouseDown={event => this.resizer.capture(this.resizeColumn, this.release, columnWidth, 0, 1.0 / k)} />
            ))}
          </div>
        </div>
        <div className="Lightbar-actions" style={{width: actionWidth}}>
          <div onClick={this.exportAssets} className='Lightbar-action'>
            <span className='Lightbar-action-text'>Download</span>
            <i className='Lightbar-btn-icon icon-download2'/>
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
  lightbarFields: state.app.lightbarFields,
  modal: state.app.modal
}), dispatch => ({
  actions: bindActionCreators({
    updateLightbarFields,
    exportAssets,
    showModal }, dispatch)
}))(Lightbar)
