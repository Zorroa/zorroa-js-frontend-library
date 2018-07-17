import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import Resizer from '../../services/Resizer'
import Logo from '../../components/Logo/Logo.js'
import { LIGHT_LOGO_MINI, DARK_LOGO_MINI } from '../../constants/themeDefaults'

export default class Sidebar extends Component {
  static displayName() {
    return 'Sidebar'
  }

  static propTypes = {
    isRightEdge: PropTypes.bool,
    isIconified: PropTypes.bool,
    onToggle: PropTypes.func,
    children: PropTypes.node,
    isDark: PropTypes.bool.isRequired,
    whiteLabelEnabled: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    isRightEdge: false,
  }

  resizer = null

  state = {
    width: 340, // Tricky ref stuff needed in componentDidMount to get width
  }

  componentWillMount = () => {
    this.resizer = new Resizer()
  }

  componentWillUnmount = () => {
    this.resizer.release()
  }

  clampWidth = width => {
    return Math.min(1020, Math.max(340, width))
  }

  resizeStart = event => {
    this.resizer.capture(
      this.resizeUpdate /* onMove    */,
      null /* onRelease */,
      this.state.width /* startX    */,
      0 /* startY    */,
      this.props.isRightEdge ? -1 : 1 /* optScaleX */,
      0,
    ) /* optScaleY */
  }

  resizeUpdate = resizeX => {
    if (resizeX < 160 && !this.props.isIconified) {
      this.props.onToggle()
    } else {
      const width = this.clampWidth(resizeX)
      this.setState({ width })
    }
  }

  toggleIfNotIconified = event => {
    if (!this.props.isIconified) return
    this.props.onToggle()
    return false
  }

  getLogo() {}

  render() {
    const {
      isIconified,
      children,
      isRightEdge,
      whiteLabelEnabled,
      isDark,
    } = this.props
    const { width } = this.state
    const isOpen = !isIconified
    const sidebarLogoClass = classnames('Sidebar__logo', {
      'Sidebar__logo--is-iconified': isIconified,
    })
    return (
      <div
        style={{ width }}
        className={classnames('Sidebar', {
          'Sidebar--is-open': isOpen,
          'Sidebar--is-right-edge': isRightEdge,
          'Sidebar--is-iconified': isIconified,
        })}>
        {!isRightEdge && <div className="Workspace-sidebar-spacer" />}
        <div
          className={classnames('scroller', { isRightEdge })}
          onClick={this.toggleIfNotIconified}>
          {children}
        </div>
        {whiteLabelEnabled && (
          <div className={sidebarLogoClass}>
            <Logo
              whiteLabelEnabled={true}
              lightLogo={isIconified && LIGHT_LOGO_MINI}
              darkLogo={isIconified && DARK_LOGO_MINI}
              dark={isDark}
            />
            {isIconified === false && (
              <span className="Sidebar__logo-description">
                Enterprise Visual Intelligence
              </span>
            )}
          </div>
        )}
        {isOpen && (
          <div
            onMouseDown={this.resizeStart}
            className={classnames('Sidebar__resize-thumb', { isRightEdge })}
          />
        )}
      </div>
    )
  }
}
