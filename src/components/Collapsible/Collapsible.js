import React, { Component, PropTypes, cloneElement } from 'react'
import { connect } from 'react-redux';
import classnames from 'classnames'

class Collapsible extends Component {
  static get displayName () {
    return 'Collapsible'
  }

  static get propTypes () {
    return {
      children: PropTypes.node,
      style: PropTypes.object,
      header: PropTypes.element.isRequired,
      sidebarKey: PropTypes.string.isRequired,
      sidebar: PropTypes.object.isRequired
    }
  }

  constructor (props) {
    super(props)
    this.state = { isOpen: false }
  }

  handleClick () {
    const { isOpen } = this.state
    const { children } = this.props
    if (children) {
      this.setState({ ...this.state, isOpen: !isOpen })
    }
  }

  render () {
    const { isOpen } = this.state
    const { children, header } = this.props

    const childrenWithProps = _ => {
      if (!isOpen) return null;
      return React.Children.map(this.props.children,
        child => cloneElement(child, { sidebarKey: this.props.sidebarKey }))
    }

    return (
      <div className={classnames('collapsible', 'flexCol', {'parent': children, 'open': open})}>
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

function mapStateToProps(state) {
  // whatever is returned will show up as props
  return { sidebar: state.sidebar};
}

// Promote BookList from a component to a container-
// it needs to knwo about this new dispatch method, selectBook.
// Make it available as a prop.
export default connect(mapStateToProps
  // , mapDispatchToProps
)(Collapsible);
