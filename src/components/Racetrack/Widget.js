import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import WidgetHeader from './WidgetHeader'

export default class Widget extends Component {
  static displayName = 'Widget'
  static propTypes = {
    children: PropTypes.node,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    field: PropTypes.string,
    backgroundColor: PropTypes.string.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string,
    enableToggleFn: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = { isOpen: true }
  }

  toggleCollapse = () => {
    const { isOpen } = this.state
    const { children, isIconified } = this.props
    // If the Sidebar is iconified, ignore the click, the sidebar will open itself instead
    if (isIconified) return
    if (children) {
      this.setState({ ...this.state, isOpen: !isOpen })
    }
    return false
  }

  render () {
    const { isOpen } = this.state
    const { children, icon, title, field, backgroundColor, isEnabled, isIconified, onClose, enableToggleFn } = this.props

    const WidgetHeaderParams = {
      icon,
      title,
      field,
      backgroundColor,
      isEnabled,
      isIconified,
      isOpen,
      onClose,
      collapseToggleFn: this.toggleCollapse,
      enableToggleFn
    }

    const { className } = this.props
    const widgetClasses = classnames('Widget', 'flexCol', {'parent': children, isOpen, isIconified, isEnabled, [className]: !!className})

    return (
      <div className={widgetClasses}>
        <WidgetHeader {...WidgetHeaderParams}/>
        { !isIconified && isOpen && (
          <div className="Widget-body">
            { children }
          </div>
        )}
      </div>
    )
  }
}
