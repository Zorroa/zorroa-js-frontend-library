import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Widget from './Widget'
import Asset from '../../models/Asset'
import Toggle from '../Toggle'
import { MultipageWidgetInfo } from './WidgetInfo'
import { createMultipageWidget } from '../../models/Widget'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'
import { isolateParent } from '../../actions/assetsAction'

class Multipage extends Component {
  static propTypes = {
    isolatedParent: PropTypes.instanceOf(Asset),
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    origin: PropTypes.string,
    actions: PropTypes.object
  }

  state = {
    sortByPage: false,
    filterMultipage: 'exists'
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  title = () => ('Multipage')

  sortPages = (sortByPage) => {
    this.setStatePromise({sortByPage})
      .then(_ => this.modifySliver())
  }

  filterMultipage = () => {
    const filterMultipage = this.state.filterMultipage === 'exists' ? 'missing' : 'exists'
    this.setFilter(filterMultipage)
  }

  setFilter = (filterMultipage) => {
    this.setStatePromise({filterMultipage})
      .then(_ => this.modifySliver())
  }

  closeParent = () => {
    this.props.actions.isolateParent()
  }

  modifySliver = () => {
    const { isolatedParent, id, widgets } = this.props
    const { sortByPage, filterMultipage } = this.state
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    const w = createMultipageWidget(undefined, undefined, isolatedParent, sortByPage, filterMultipage, widget.isEnabled, widget.isPrototypeOf())
    w.id = id
    this.props.actions.modifyRacetrackWidget(w)
  }

  render () {
    const { isolatedParent, id, isOpen, onOpen, isIconified, floatBody } = this.props
    const { sortByPage, filterMultipage } = this.state
    const active = true
    const title = active ? (isOpen ? MultipageWidgetInfo.title : undefined) : MultipageWidgetInfo.title
    const field = active ? (isOpen ? undefined : this.title(isolatedParent)) : undefined
    const isolatedParentId = isolatedParent && isolatedParent.parentId()
    const asset = new Asset({id: isolatedParentId})
    const width = 120
    const height = 120
    const url = asset.closestProxyURL(this.props.origin, width, height)
    const style = { backgroundImage: `url(${url})`, minWidth: width, minHeight: height }
    return (
      <Widget className='SortOrder'
              id={id}
              isOpen={isOpen}
              onOpen={onOpen}
              floatBody={floatBody}
              title={title}
              field={field}
              backgroundColor={MultipageWidgetInfo.color}
              isIconified={isIconified}
              icon={MultipageWidgetInfo.icon}>
          { isolatedParentId ? (
            <div className="Multipage-body">
              <div className="Multipage-parent" style={style}>
                <div className="Multipage-parent-close icon-cancel-circle" onClick={this.closeParent}/>
              </div>
              <div className="Multipage-sort">
                <div className="Multipage-label" onClick={_ => this.sortPages(false)}>Search Order</div>
                <Toggle checked={sortByPage} onChange={_ => this.sortPages(!sortByPage)} />
                <div className="Multipage-label" onClick={_ => this.sortPages(true)}>Page Order</div>
              </div>
            </div>
          ) : (
            <div className="Multipage-toggle">
              <div className="Multipage-label" onClick={_ => this.setFilter('missing')}>Monopage</div>
              <Toggle checked={filterMultipage === 'exists'} onChange={this.filterMultipage} />
              <div className="Multipage-label" onClick={_ => this.setFilter('exists')}>Multipage</div>
            </div>
          )}
      </Widget>
    )
  }
}

export default connect(state => ({
  isolatedParent: state.assets.isolatedParent,
  widgets: state.racetrack.widgets,
  origin: state.auth.origin
}), dispatch => ({
  actions: bindActionCreators({
    modifyRacetrackWidget,
    isolateParent
  }, dispatch)
}))(Multipage)
