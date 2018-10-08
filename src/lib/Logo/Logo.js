import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
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

  recursiveDecode(string) {
    const decodedString = decodeURIComponent(string)
    if (decodedString === string) {
      return decodedString
    }
    return this.recursiveDecode(decodedString)
  }

  generateLogoSrc() {
    const { dark } = this.props
    const isDark = dark === true
    const logo = isDark ? this.getDarkLogo() : this.getLightLogo()
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      this.recursiveDecode(logo),
    )}`
  }

  render() {
    const src = this.generateLogoSrc()
    return <img className="Logo" src={src} alt={`Logo`} />
  }
}

export default Logo
