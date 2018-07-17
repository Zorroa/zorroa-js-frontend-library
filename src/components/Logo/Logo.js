import React, { PropTypes, PureComponent } from 'react'
import { LIGHT_LOGO, DARK_LOGO } from '../../constants/themeDefaults'

class Logo extends PureComponent {
  static propTypes = {
    dark: PropTypes.bool.isRequired,
    whiteLabelEnabled: PropTypes.bool.isRequired,
    darkLogo: PropTypes.string,
    lightLogo: PropTypes.string,
  }

  getDarkLogo() {
    const { darkLogo, whiteLabelEnabled } = this.props

    if (darkLogo && whiteLabelEnabled) {
      return this.props.darkLogo
    }

    return DARK_LOGO
  }

  getLightLogo() {
    const { lightLogo, whiteLabelEnabled } = this.props

    if (lightLogo && whiteLabelEnabled) {
      return lightLogo
    }

    return LIGHT_LOGO
  }

  render() {
    const { dark } = this.props
    const isDark = dark === true
    const logo = isDark ? this.getDarkLogo() : this.getLightLogo()
    const src = `data:image/svg+xml;utf8,${logo}`
    return <img className="Logo" src={src} alt={`Logo`} />
  }
}

export default Logo
