import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { toggleCollapsible } from '../../actions/appActions'

class ImporterSection extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    collapsibleOpen: PropTypes.object,
    actions: PropTypes.object,
    children: PropTypes.node,
  }

  toggleCollapsed = name => {
    const { collapsibleOpen, actions } = this.props
    actions.toggleCollapsible(name, !collapsibleOpen[name])
  }

  render() {
    const { name, collapsibleOpen, children } = this.props
    const collapsedName = `job${name.toUpperCase()}`
    const collapsed = collapsibleOpen[collapsedName]
    return (
      <div
        className={classnames('ImporterSection', `Importer-${name}`, {
          collapsed,
        })}>
        {collapsed && <div className="ImporterSection-title">{name}</div>}
        <div
          className={classnames(
            'ImporterSection-collapser',
            'icon-chevron-down',
            { collapsed },
          )}
          onClick={_ => this.toggleCollapsed(collapsedName)}
        />
        {!collapsed && children}
      </div>
    )
  }
}

export default connect(
  state => ({
    collapsibleOpen: state.app.collapsibleOpen,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        toggleCollapsible,
      },
      dispatch,
    ),
  }),
)(ImporterSection)
