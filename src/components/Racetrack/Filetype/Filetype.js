import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classnames from 'classnames'

import { createFiletypeWidget } from '../../../models/Widget'
import { FiletypeWidgetInfo } from '../WidgetInfo'
import Widget from '../Widget'
import Check from '../../Check'
import Suggestions from '../../Suggestions'
import {
  allExts,
  groupExts,
  FILE_GROUP_IMAGES,
  FILE_GROUP_VECTORS,
  FILE_GROUP_VIDEOS,
  FILE_GROUP_DOCUMENTS,
} from '../../../constants/fileTypes'

const extField = 'source.extension'

class Filetype extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    aggs: PropTypes.object,
    widgets: PropTypes.arrayOf(PropTypes.object),
  }

  state = {
    exts: [],
    suggestions: [],
    suggestion: '',
  }

  componentWillMount() {
    // Restore saved state from widget
    const { id, widgets } = this.props
    const widget = widgets && widgets.find(widget => widget.id === id)
    if (widget && widget.state)
      this.setState({ exts: (widget.state && widget.state.exts) || [] })
  }

  modifySliver = exts => {
    const { id, widgets } = this.props
    const index = widgets && widgets.findIndex(widget => id === widget.id)
    const oldWidget = widgets && widgets[index]
    let isEnabled, isPinned
    if (oldWidget) {
      isEnabled = oldWidget.isEnabled
      isPinned = oldWidget.isPinned
    }
    const widget = createFiletypeWidget(
      extField,
      'string',
      exts,
      isEnabled,
      isPinned,
    )
    widget.id = this.props.id
    this.props.actions.modifyRacetrackWidget(widget)
    this.setState({ exts })
  }

  selectTypes = exts => {
    let newExts = [...this.state.exts]
    if (this.selectionState(exts) === 'checked') {
      exts.forEach(ext => {
        const index = newExts.findIndex(e => e === ext)
        newExts.splice(index, 1)
      })
    } else {
      exts.forEach(ext => {
        const index = newExts.findIndex(e => e === ext)
        if (index < 0) {
          newExts.push(ext)
        }
      })
    }
    this.modifySliver(newExts)
  }

  toggleType = ext => {
    let newExts = [...this.state.exts]
    const index = newExts.findIndex(e => e === ext)
    if (index < 0) {
      newExts.push(ext)
    } else {
      newExts.splice(index, 1)
    }
    this.modifySliver(newExts)
  }

  removeType = ext => {
    const { exts } = this.state
    const index = exts.findIndex(e => e === ext)
    if (index >= 0) {
      let newExt = [...exts]
      newExt.splice(index, 1)
      this.modifySliver(newExt)
    }
  }

  selectionState(exts) {
    if (!exts || !this.state.exts) return 'empty'
    let found = 0
    for (let i = 0; i < exts.length; ++i) {
      if (this.state.exts.findIndex(ext => ext === exts[i]) >= 0) {
        found++
      }
    }
    if (found === exts.length) return 'checked'
    if (found > 0) return 'indetermined'
    return 'empty'
  }

  suggest = (suggestion, lastAction) => {
    console.log('Suggest ' + suggestion)
    let suggestions = []
    if (suggestion && suggestion.length && lastAction === 'type') {
      const key = suggestion.toLowerCase()
      Object.keys(allExts)
        .filter(ext => ext.toLowerCase().includes(key))
        .forEach(text => suggestions.push({ text }))
      Object.keys(groupExts)
        .filter(ext => ext.toLowerCase().includes(key))
        .forEach(text => suggestions.push({ text }))
      this.setState({ suggestions, suggestion })
    }
  }

  select = text => {
    this.setState({ suggestions: [], suggestion: '' })
    if (text) {
      if (groupExts[text]) {
        this.selectTypes(groupExts[text])
      } else {
        this.selectTypes([text])
      }
    }
  }

  aggCount(ext) {
    const { id, aggs } = this.props
    const buckets =
      aggs && id in aggs && aggs[id].filetype ? aggs[id].filetype.buckets : []
    for (let i = 0; i < buckets.length; ++i) {
      if (buckets[i].key === ext) return buckets[i].doc_count
    }
    return 0
  }

  groupAggCount(group) {
    let count = 0
    const exts = groupExts[group]
    exts.forEach(ext => {
      count += this.aggCount(ext)
    })
    return count
  }

  title() {
    let title = ''
    const all = [...this.state.exts]
    Object.keys(groupExts).forEach(group => {
      const exts = groupExts[group]
      let count = 0
      for (let i = 0; i < exts.length; ++i)
        if (all.indexOf(exts[i]) >= 0) count++
      if (count === exts.length) {
        // All extensions for group are selected, add to title and remove extensions
        if (title.length) title += ','
        title += group
        exts.forEach(ext => {
          const idx = all.indexOf(ext)
          all.splice(idx, 1)
        })
      }
    })
    if (all.length) {
      if (title.length) title += ','
      title += all.join(',')
    }
    return title
  }

  renderSelected() {
    const { exts } = this.state
    if (!exts || !exts.length) return null
    return exts.map(ext => (
      <div key={ext} className="Filetype-selected-ext">
        {ext}
        <div
          className="Filetype-remove-ext icon-cross"
          onClick={() => {
            this.removeType(ext)
          }}
        />
      </div>
    ))
  }

  getClassNamesForFileIcons(group) {
    const icons = {
      [FILE_GROUP_VECTORS]: 'icon-vector',
      [FILE_GROUP_VIDEOS]: 'icon-play2',
      [FILE_GROUP_IMAGES]: 'icon-picture2',
      [FILE_GROUP_DOCUMENTS]: 'icon-papers',
    }
    const icon = icons[group]
    return icon
  }

  renderGroup(group) {
    const exts = groupExts[group]
    const count = this.groupAggCount(group)
    const icon = this.getClassNamesForFileIcons(group)
    return (
      <div
        className={classnames('Filetype-group', `Filetype-group-${group}`, {
          disabled: count <= 0,
        })}
        key={group}>
        <Check
          state={this.selectionState(exts)}
          onClick={() => this.selectTypes(exts)}
          color={FiletypeWidgetInfo.color}
        />
        <div className={classnames('Filetype-group-icon', `${icon}`)} />
        <div className="Filetype-group-label">{group}</div>
        {count ? <div className="Filetype-group-count">{count}</div> : null}
      </div>
    )
  }

  renderGroups() {
    return (
      <div className="Filetype-groups">
        <div className="Filetype-title">File Groups</div>
        <div className="Filetype-groups-list">
          {Object.keys(groupExts).map(group => this.renderGroup(group))}
        </div>
      </div>
    )
  }

  renderExt(ext) {
    const count = this.aggCount(ext)
    return (
      <div
        className={classnames('Filetype-type', { disabled: count <= 0 })}
        key={ext}>
        <Check
          state={this.selectionState([ext])}
          onClick={() => {
            this.toggleType(ext)
          }}
          color={FiletypeWidgetInfo.color}
        />
        <div className="Filetype-type-ext">{ext}&nbsp;-&nbsp;</div>
        <div className="Filetype-type-label">{allExts[ext]}</div>
        {count ? <div className="Filetype-type-count">{count}</div> : null}
      </div>
    )
  }

  renderExts() {
    return (
      <div className="Filetype-types">
        <div className="Filetype-title">All Types</div>
        <div className="Filetype-types-list">
          {Object.keys(allExts).map(ext => this.renderExt(ext))}
        </div>
      </div>
    )
  }

  render() {
    const { id, widgets, floatBody, isIconified, isOpen, onOpen } = this.props
    const { exts, suggestions, suggestion } = this.state
    const isSelected = this.state.exts && this.state.exts.length > 0
    const placeholder = isSelected ? '' : 'Search filetypes'
    const style = { width: isSelected ? '60px' : '150px' }
    const active = exts && exts.length
    const title = active
      ? isOpen ? FiletypeWidgetInfo.title : undefined
      : FiletypeWidgetInfo.title
    const field = active ? (isOpen ? undefined : this.title()) : undefined

    // Reflect current state in widget to recover after save
    const widget = widgets && widgets.find(widget => id === widget.id)
    widget.state = this.state

    return (
      <Widget
        className="Filetype"
        id={id}
        floatBody={floatBody}
        title={title}
        field={field}
        backgroundColor={FiletypeWidgetInfo.color}
        isIconified={isIconified}
        isOpen={isOpen}
        onOpen={onOpen}
        icon={FiletypeWidgetInfo.icon}>
        <div className="Filetype-body">
          <div className="Filetype-selected">
            {this.renderSelected()}
            <div className="Filetype-suggestions">
              <div className="Filetype-suggestions-body">
                <Suggestions
                  suggestions={suggestions}
                  placeholder={placeholder}
                  style={style}
                  className="clear"
                  value={suggestion}
                  onChange={this.suggest}
                  onSelect={this.select}
                />
              </div>
            </div>
          </div>
          <div className="Filetype-type-sections">
            {this.renderGroups()}
            {this.renderExts()}
          </div>
        </div>
      </Widget>
    )
  }
}

export default Filetype