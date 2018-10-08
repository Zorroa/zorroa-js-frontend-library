import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ModalOverlayHeader from './ModalOverlayHeader'
import ModalOverlaySidebar from './ModalOverlaySidebar'
import ModalOverlayBody from './ModalOverlayBody'
import ModalOverlayFooter from './ModalOverlayFooter'
import classnames from 'classnames'

export default class ModalOverlay extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    size: PropTypes.oneOf(['narrow', 'small']),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.oneOf([
          ModalOverlayHeader,
          ModalOverlaySidebar,
          ModalOverlayBody,
          ModalOverlayFooter,
        ]),
      ),
      PropTypes.node,
    ]),
    onUnderlayClickDisabled: PropTypes.bool,
    containerClass: PropTypes.string,
  }

  state = {
    isClosing: false,
  }

  onClose = event => {
    if (this.props.onClose === undefined) {
      return
    }
    this.setState(
      {
        isClosing: true,
      },
      () => {
        setTimeout(() => {
          this.props.onClose(event)
        }, 900)
      },
    )
  }

  onUnderlayClick = event => {
    if (event.currentTarget === event.target) {
      this.onClose(event)
    }
  }

  render() {
    const modalOverlayClasses = classnames('ModalOverlay', {
      'ModalOverlay--closing': this.state.isClosing === true,
      'ModalOverlay--closeable': this.props.onClose,
    })
    const modalOverlayContainerClasses = classnames('ModalOverlay__container', {
      'ModalOverlay__container--small': this.props.size === 'small',
      'ModalOverlay__container--closing': this.state.isClosing === true,
    })
    const children = Array.isArray(this.props.children)
      ? this.props.children
      : [this.props.children]
    return (
      <div className={modalOverlayClasses} onClick={this.onUnderlayClick}>
        <div className={modalOverlayContainerClasses}>
          <div className="ModalOverlay__header">
            {children
              .filter(child => child.type === ModalOverlayHeader)
              .map((element, index) => {
                return React.cloneElement(element, {
                  size: this.props.size,
                  onClose: this.onClose,
                  key: `header-children-${index}`,
                })
              })}
          </div>
          <div className="ModalOverlay__main">
            {children &&
              children
                .filter(
                  child =>
                    child.type === ModalOverlaySidebar ||
                    child.type === ModalOverlayBody,
                )
                .map((element, index) => {
                  return React.cloneElement(element, {
                    size: this.props.size,
                    key: `main-children-${index}`,
                  })
                })}
          </div>
        </div>
      </div>
    )
  }
}
