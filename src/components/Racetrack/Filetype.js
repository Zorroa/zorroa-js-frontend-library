import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import WidgetModel from '../../models/Widget'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { FiletypeWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import Widget from './Widget'
import Check from '../Check'
import Suggestions from '../Suggestions'

const allExts = {
  pdf: 'Adobe Acrobat',
  psd: 'Adobe Photoshop',
  gif: 'Graphics Interchange Foramt',
  png: 'Portable Network Graphics',
  jpg: 'Joint Photographic Experts Group',
  tiff: 'Tagged Image File Format',
  mov: 'Quicktime Movie',
  mp4: 'Video File',
  ogg: 'Ogg Vorbis',
  mpg: 'Motion Picture Group',
  svg: 'Scalable Vector Graphic'
  // aac: 'Advanced Audio Coding',
  // mp3: 'Music File',
  // ai: 'Adobe Illustrator',
  // cdr: 'Corel Draw',
  // cdraw: 'Google Drive Drawing',
  // indd: 'Adobe inDesign',
  // dicom: 'Medical Images',
  // dxa: 'Bones and stuff',
  // pet: 'Positron Electron Transmission',
  // mri: 'Magnetic Resonance Imaging',
  // ultra: 'Ultrasound',
  // xray: 'X-Ray',
  // shp: 'Shapefile'
  // kml: 'Keyhole Markup Language (Google Earth)',
  // gdb: 'File Geodatabase',
  // osm: 'Open Street Map',
  // geotiff: 'Geographic Tagged Image File Format'
}

const groupExts = {
  'Image Files': ['gif', 'png', 'jpg', 'tif', 'geotiff', 'psd'],
  'Video Files': ['mp4', 'mov', 'ogg'],
  'Vector Files': ['pdf', 'svg', 'ai', 'shp', 'cdr']
  // 'Audio Files': ['aac', 'mp3'],
  // 'Design Source Files - sketch, Adobe': ['ai', 'indd', 'psd'],
  // 'Map Files': ['shp', 'kml', 'gdb', 'osm', 'geotiff'],
  // 'Medical Files': ['dicom', 'dxa', 'pet', 'mri', 'ultra', 'xray'],
}

const extField = 'source.extension'

class Filetype extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    aggs: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    exts: [],
    suggestions: [],
    suggestion: ''
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver) {
      if (widget.sliver.filter) {
        const exts = widget.sliver.filter.terms[extField]
        if (JSON.stringify(exts) !== JSON.stringify(this.state.exts)) {
          this.setState({exts, suggestions: [], suggestion: ''})
        }
      } else if (this.state.exts && this.state.exts.length) {
        this.setState({exts: [], suggestions: [], suggestion: ''})
      }
    } else {
      this.modifySliver([])
    }
  }

  modifySliver = (exts) => {
    const type = FiletypeWidgetInfo.type
    const order = { '_term': 'asc' }
    const aggs = { filetype: { terms: { field: extField, order, size: 100 } } }
    let sliver = new AssetSearch({aggs})
    if (exts && exts.length) {
      sliver.filter = new AssetFilter({terms: {[extField]: exts}})
    }
    const widget = new WidgetModel({id: this.props.id, type, sliver})
    this.props.actions.modifyRacetrackWidget(widget)
  }

  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  selectTypes = (exts) => {
    let newExts = [...this.state.exts]
    if (this.selectionState(exts) === 'checked') {
      exts.forEach(ext => {
        const index = newExts.findIndex(e => (e === ext))
        newExts.splice(index, 1)
      })
    } else {
      exts.forEach(ext => {
        const index = newExts.findIndex(e => (e === ext))
        if (index < 0) {
          newExts.push(ext)
        }
      })
    }
    this.modifySliver(newExts)
  }

  toggleType = (ext) => {
    let newExts = [...this.state.exts]
    const index = newExts.findIndex(e => (e === ext))
    if (index < 0) {
      newExts.push(ext)
    } else {
      newExts.splice(index, 1)
    }
    this.modifySliver(newExts)
  }

  removeType = (ext) => {
    const { exts } = this.state
    const index = exts.findIndex(e => (e === ext))
    if (index >= 0) {
      let newExt = [...exts]
      newExt.splice(index, 1)
      this.modifySliver(newExt)
    }
  }

  selectionState (exts) {
    let found = 0
    for (let i = 0; i < exts.length; ++i) {
      if (this.state.exts.findIndex(ext => (ext === exts[i])) >= 0) {
        found++
      }
    }
    if (found === exts.length) return 'checked'
    if (found > 0) return 'indetermined'
    return 'empty'
  }

  suggest = (suggestion) => {
    console.log('Suggest ' + suggestion)
    let suggestions = []
    if (suggestion && suggestion.length) {
      const key = suggestion.toLowerCase()
      Object.keys(allExts).filter(ext => (ext.toLowerCase().includes(key))).forEach(text => suggestions.push({text}))
      Object.keys(groupExts).filter(ext => (ext.toLowerCase().includes(key))).forEach(text => suggestions.push({text}))
    }
    this.setState({suggestions, suggestion})
  }

  select = (text) => {
    console.log('Select ' + text)
    this.setState({suggestions: [], suggestion: ''})
    if (text) {
      if (groupExts[text]) {
        this.selectTypes(groupExts[text])
      } else {
        this.selectTypes([text])
      }
    }
  }

  aggCount (ext) {
    const { id, aggs } = this.props
    const buckets = aggs && (id in aggs) ? aggs[id].filetype.buckets : []
    for (let i = 0; i < buckets.length; ++i) {
      if (buckets[i].key === ext) return buckets[i].doc_count
    }
    return 0
  }

  groupAggCount (group) {
    let count = 0
    groupExts[group].forEach(ext => { count += this.aggCount(ext) })
    return count
  }

  renderSelected () {
    const { exts } = this.state
    if (!exts || !exts.length) return null
    return exts.map(ext => (
      <div key={ext} className="Filetype-selected-ext">
        {ext}
        <div className="Filetype-remove-ext icon-cross" onClick={e => { this.removeType(ext) }} />
      </div>
    ))
  }

  renderGroup (group) {
    const exts = groupExts[group]
    const count = this.groupAggCount(group)
    return (
      <div className={classnames('Filetype-group', {disabled: count <= 0})} key={group}>
        <Check state={this.selectionState(exts)}
               onClick={e => this.selectTypes(exts)}
               color='#ef4487'/>
        <div className="Filetype-group-icon icon-files"/>
        <div className="Filetype-group-label">{group}</div>
        { count ? <div className="Filetype-group-count">{count}</div> : null }
      </div>
    )
  }

  renderGroups () {
    return (
      <div className="Filetype-groups">
        <div className="Filetype-title">
          File Groups
        </div>
        <div className="Filetype-groups-list">
          { Object.keys(groupExts).map(group => (this.renderGroup(group))) }
        </div>
      </div>
    )
  }

  renderExt (ext) {
    const count = this.aggCount(ext)
    return (
      <div className={classnames('Filetype-type', {disabled: count <= 0})} key={ext}>
        <Check state={this.selectionState([ext])}
               onClick={e => { this.toggleType(ext) }}
               color='#ef4487' />
        <div className="Filetype-type-ext">{ext}&nbsp;-&nbsp;</div>
        <div className="Filetype-type-label">{allExts[ext]}</div>
        { count ? <div className="Filetype-type-count">{count}</div> : null }
      </div>
    )
  }

  renderExts () {
    return (
      <div className="Filetype-types">
        <div className="Filetype-title">
          All Types
        </div>
        <div className="Filetype-types-list">
          { Object.keys(allExts).map(ext => (this.renderExt(ext))) }
        </div>
      </div>
    )
  }

  render () {
    const { isIconified } = this.props
    const { suggestions, suggestion } = this.state
    const isSelected = this.state.exts.length > 0
    const placeholder = isSelected ? '' : 'Search filetypes'
    const style = { height: '14px', width: isSelected ? '40px' : '90px' }
    return (
      <Widget className="Filetype"
              header={(
                <div className="Filetype-header">
                  <div className="Filetype-header-label">
                    <span className="Filetype-header-title">
                      { FiletypeWidgetInfo.title }
                    </span>
                  </div>
                </div>
              )}
              backgroundColor={FiletypeWidgetInfo.color}
              isIconified={isIconified}
              icon={FiletypeWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="Filetype-body">
          <div className="Filetype-selected">
            { this.renderSelected() }
            <div className="Filetype-suggestions">
              <div className="Filetype-suggestions-search-icon icon-search"/>
              <Suggestions suggestions={suggestions} placeholder={placeholder} style={style}
                           value={suggestion} onChange={this.suggest} onSelect={this.select}/>
            </div>
          </div>
          <div className="Filetype-type-sections">
            { this.renderGroups() }
            { this.renderExts() }
          </div>
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    aggs: state.assets && state.assets.aggs,
    widgets: state.racetrack && state.racetrack.widgets
  }), dispatch => ({
    actions: bindActionCreators({
      modifyRacetrackWidget,
      removeRacetrackWidgetIds,
      showModal }, dispatch)
  })
)(Filetype)
