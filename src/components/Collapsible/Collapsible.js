import React, { Component, PropTypes, cloneElement } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames'

import { setCollapsibleOpen } from '../../actions/collapsibleAction'

class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static get propTypes () {
    return {
      // actions from mapDispatchToProps below
      actions: PropTypes.object.isRequired,

      // state from mapStateToProps below
      Collapsible: PropTypes.object.isRequired,

      // props defined by intstantiation
      children: PropTypes.node,
      style: PropTypes.object,
      header: PropTypes.element.isRequired,
      sidebarIsOpen: PropTypes.bool.isRequired,
      isOpenKey: PropTypes.string
    }
  }

  constructor (props) {
    super(props)

    const { Collapsible, isOpenKey } = this.props
    const isOpen = !!(isOpenKey && Collapsible[isOpenKey])
    this.state = { isOpen }
  }

  handleClick () {
    // ignore collapsible open/close events when the sidebar is closed
    // we could alternatively open the sidebar and process this event...
    if (!this.props.sidebarIsOpen) return

    const { isOpen } = this.state
    const { children, isOpenKey } = this.props
    if (children) {
      if (isOpenKey) {
        this.props.actions.setCollapsibleOpen(isOpenKey, !isOpen)
      }

      this.setState({ ...this.state, isOpen: !isOpen })
    }
  }

  render () {
    const { children, header } = this.props
    const { isOpen } = this.state

    const childrenWithProps = _ => {
      var sidebarIsOpen = this.props.sidebarIsOpen
      if (!isOpen) return null
      if (!sidebarIsOpen) return null
      return React.Children.map(this.props.children,
        child => cloneElement(child, { sidebarIsOpen }))
    }

    return (
      <div className={classnames('collapsible', 'flexCol', { 'parent': children, isOpen })}>
        <div className="collapsible-header flexCenter" onClick={this.handleClick.bind(this)}>
          { cloneElement(header, { isOpen, isParent: children && children.length > 0 }) }
        </div>
        <div style={{marginLeft: '16px'}} className="collapsible-body">
          { childrenWithProps() }
        </div>
      </div>
    )
  }
}

// ----------------------------------------------------------------------

function mapStateToProps (state) {
  // whatever is returned will show up as props
  // inside of Component
  return { Collapsible: state.Collapsible }
}

// Anything returned from this func will end up as props
// on the Component container
function mapDispatchToProps (dispatch) {
  // When action is called, the result should
  // be passed to all our reducers
  return {
    actions: bindActionCreators({setCollapsibleOpen}, dispatch)
  }
}

// Promote Component from a component to a container-
// it needs to know about this new dispatch method.
// Make it available as a prop.
export default connect(mapStateToProps, mapDispatchToProps)(Collapsible)
