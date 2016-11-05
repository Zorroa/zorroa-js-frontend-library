import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import WidgetHeader from './WidgetHeader'

export default class Widget extends Component {
  static displayName = 'Widget'
  static propTypes = {
    children: PropTypes.node,
    icon: PropTypes.string.isRequired,
    header: PropTypes.element.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = { isOpen: true }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event) {
    const { isOpen } = this.state
    const { children, onToggle } = this.props
    if (children) {
      this.setState({ ...this.state, isOpen: !isOpen })
    }
    onToggle && onToggle(!isOpen)
    return false
  }

  render () {
    const { isOpen } = this.state
    const { children, icon, header, isIconified, onClose } = this.props

    const WidgetHeaderParams = {
      icon,
      header,
      isIconified,
      isOpen,
      onClose,
      onToggle: this.handleClick.bind(this)
    }

    const { className } = this.props
    const widgetClasses = classnames('Widget', 'flexCol', {'parent': children, open, [className]: !!className})

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
