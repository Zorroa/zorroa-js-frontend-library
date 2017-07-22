import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Widget from './Widget'
import { MultipageWidgetInfo } from './WidgetInfo'
import { createMultipageWidget } from '../../models/Widget'
import { modifyRacetrackWidget } from '../../actions/racetrackAction'

class Multipage extends Component {
  static propTypes = {
    isolatedParentId: PropTypes.string,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.object
  }

  state = {
    sortByPage: false
  }

  setStatePromise = (newState) => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  title = (parentId) => ('Multipage')

  sortPages = () => {
    this.setStatePromise({sortByPage: !this.state.sortByPage})
      .then(_ => this.modifySliver())
  }

  modifySliver = () => {
    const { isolatedParentId, id, widgets } = this.props
    const { sortByPage } = this.state
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    const w = createMultipageWidget(undefined, undefined, isolatedParentId, sortByPage, widget.isEnabled, widget.isPrototypeOf())
    w.id = id
    this.props.actions.modifyRacetrackWidget(w)
  }

  render () {
    const { isolatedParentId, id, isOpen, onOpen, isIconified, floatBody } = this.props
    const { sortByPage } = this.state
    const parentId = 1
    const active = parentId
    const title = active ? (isOpen ? MultipageWidgetInfo.title : undefined) : MultipageWidgetInfo.title
    const field = active ? (isOpen ? undefined : this.title(parentId)) : undefined
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
        <div className="Multipage-body">
          <div className="Multipage-parent">
            {isolatedParentId}
          </div>
          <div className="Multipage-sort">
            <input type="checkbox" checked={sortByPage} onChange={this.sortPages}/>
            <div>Sort by page</div>
          </div>
        </div>
      </Widget>
    )
  }
}

export default connect(state => ({
  isolatedParentId: state.assets.isolatedParentId,
  widgets: state.racetrack.widgets
}), dispatch => ({
  actions: bindActionCreators({
    modifyRacetrackWidget
  }, dispatch)
}))(Multipage)
