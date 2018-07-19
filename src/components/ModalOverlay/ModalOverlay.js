import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ModalOverlayHeader from './ModalOverlayHeader'
import ModalOverlaySidebar from './ModalOverlaySidebar'
import ModalOverlayBody from './ModalOverlayBody'
import ModalOverlayFooter from './ModalOverlayFooter'
import classnames from 'classnames'

export default class ModalOverlay extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    size: PropTypes.oneOf(['narrow']),
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
  }

  state = {
    isClosing: false,
  }

  onClose = event => {
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
    })
    const modalOverlayContainerClasses = classnames('ModalOverlay__container', {
      'ModalOverlay__container--closing': this.state.isClosing === true,
    })

    return (
      <div className={modalOverlayClasses} onClick={this.onUnderlayClick}>
        <div className={modalOverlayContainerClasses}>
          <div className="ModalOverlay__header">
            {Array.isArray(this.props.children) &&
              this.props.children
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
            {Array.isArray(this.props.children) &&
              this.props.children
                .filter(child =>
                  [ModalOverlaySidebar, ModalOverlayBody].includes(child.type),
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
