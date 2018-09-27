import PropTypes from 'prop-types'
import React, { Component } from 'react'

import DropdownMenu, {
  DropdownItem,
  DropdownGroup,
  DropdownFontIcon,
} from '../../components/DropdownMenu'

export default class ContextMenu extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        fn: PropTypes.func,
        icon: PropTypes.string,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.func.isRequired,
      }),
    ),
    contextMenuPos: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string.isRequired,
        title: PropTypes.element.isRequired,
        order: PropTypes.string,
        width: PropTypes.number.isRequired,
      }),
    ),
    selectedFieldIndex: PropTypes.number,
    onDismissFn: PropTypes.func.isRequired,
    actions: PropTypes.shape({
      resetContextMenuPos: PropTypes.func.isRequired,
    }).isRequired,
  }

  dismissOnClickOutside = event => {
    if (!this.doesContextMenuRefNodeContainElement(event.target)) {
      this.props.onDismissFn()
    }
  }

  doesContextMenuRefNodeContainElement(element) {
    return this.contextMenuRefNode && this.contextMenuRefNode.contains(element)
  }

  componentDidMount = () => {
    document.addEventListener('click', this.dismissOnClickOutside)
  }

  componentWillUnmount = () => {
    document.removeEventListener('click', this.dismissOnClickOutside)
  }

  // Keep the context menu from running off the bottom of the screen
  constrainContextMenu = ctxMenu => {
    if (!ctxMenu) return
    const { contextMenuPos } = this.props
    if (contextMenuPos.y + ctxMenu.clientHeight > window.innerHeight) {
      const newContextMenuPos = {
        ...contextMenuPos,
        y: window.innerHeight - ctxMenu.clientHeight,
      }
      this.props.actions.resetContextMenuPos(newContextMenuPos)
    }
  }

  render() {
    const {
      contextMenuPos,
      onDismissFn,
      items,
      selectedFieldIndex,
    } = this.props

    return (
      <div
        ref={contextMenuRefNode =>
          (this.contextMenuRefNode = contextMenuRefNode)
        }>
        <div
          className="ContextMenu"
          ref={this.constrainContextMenu}
          onClick={e => {
            e.preventDefault()
            onDismissFn()
          }}
          onContextMenu={e => {
            e.preventDefault()
            onDismissFn()
          }}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}>
          <DropdownMenu>
            <DropdownGroup>
              {items.map(item => {
                const isDisabled = item.disabled(selectedFieldIndex)
                const onClickCallback = isDisabled ? undefined : item.fn
                return (
                  <DropdownItem key={item.label} onClick={onClickCallback}>
                    <DropdownFontIcon icon={item.icon} />
                    {item.label}
                  </DropdownItem>
                )
              })}
            </DropdownGroup>
          </DropdownMenu>
        </div>
      </div>
    )
  }
}
