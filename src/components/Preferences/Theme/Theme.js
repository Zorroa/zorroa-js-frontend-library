import React, { Component, PropTypes } from 'react'
import Heading from '../../Heading'
import {
  FormCheckbox,
  FormInput,
  FormLabel,
  FormButton,
  FormFile,
} from '../../Form'

export default class Theme extends Component {
  static propTypes = {
    whiteLabelEnabled: PropTypes.bool.isRequired,
    keyColor: PropTypes.string.isRequired,
    actions: PropTypes.shape({
      saveTheme: PropTypes.func.isRequired,
    }).isRequired,
    tutorialUrl: PropTypes.string.isRequired,
    releaseNotesUrl: PropTypes.string.isRequired,
    faqUrl: PropTypes.string.isRequired,
    supportUrl: PropTypes.string.isRequired,
    lightLogo: PropTypes.string.isRequired,
    darkLogo: PropTypes.string.isRequired,
    themeSaveState: PropTypes.oneOf(['pending', 'failed', 'succeeded'])
      .isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      whiteLabelEnabled: props.whiteLabelEnabled,
      keyColor: props.keyColor,
      isColorValid: true,
      tutorialUrl: props.tutorialUrl,
      releaseNotesUrl: props.releaseNotesUrl,
      faqUrl: props.faqUrl,
      supportUrl: props.supportUrl,
      lightLogo: props.lightLogo,
      darkLogo: props.darkLogo,
      invalidLightLogo: false,
      showSubmitSuccess: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.themeSaveState === 'succeeded' &&
      this.props.themeSaveState === 'pending'
    ) {
      this.setState(
        {
          showSubmitSuccess: true,
        },
        () => {
          setTimeout(() => {
            this.setState({
              showSubmitSuccess: false,
            })
          }, 1000)
        },
      )
    }
  }

  toggleWhiteLabelEnabled = shouldEnable => {
    this.setState({
      whiteLabelEnabled: shouldEnable,
    })
  }

  setColor = keyColor => {
    const hexRegex = /#[a-f0-9]{6}/i
    this.setState({
      keyColor,
      isColorValid: hexRegex.test(keyColor),
    })
  }

  save = event => {
    event.preventDefault()
    const {
      keyColor,
      whiteLabelEnabled,
      tutorialUrl,
      releaseNotesUrl,
      faqUrl,
      supportUrl,
      lightLogo,
      darkLogo,
    } = this.state

    this.props.actions.saveTheme({
      keyColor,
      whiteLabelEnabled,
      tutorialUrl,
      releaseNotesUrl,
      faqUrl,
      supportUrl,
      lightLogo,
      darkLogo,
    })
  }

  isWhiteLabelEnabled() {
    return this.state.whiteLabelEnabled === true
  }

  setTutorialUrl = tutorialUrl => {
    this.setState({ tutorialUrl })
  }

  setReleaseNotesUrl = releaseNotesUrl => {
    this.setState({ releaseNotesUrl })
  }

  setFaqUrl = faqUrl => {
    this.setState({ faqUrl })
  }

  setSupportUrl = supportUrl => {
    this.setState({ supportUrl })
  }

  hasErrors() {
    return (
      this.state.isColorValid === false || this.state.invalidLightLogo === true
    )
  }

  setLightThemeLogo = files => {
    const file = files[0]
    this.setState({
      lightLogo: file.content,
    })
  }

  setDarkThemeLogo = files => {
    const file = files[0]
    this.setState({
      darkLogo: file.content,
    })
  }

  getSubmitState() {
    const themeSaveState = this.props.themeSaveState
    if (themeSaveState === 'pending') {
      return 'loading'
    }

    if (themeSaveState === 'failed') {
      return 'error'
    }

    if (this.state.showSubmitSuccess === true) {
      return 'success'
    }
  }

  render() {
    const {
      keyColor,
      isColorValid,
      tutorialUrl,
      releaseNotesUrl,
      faqUrl,
      supportUrl,
    } = this.state
    return (
      <div className="Theme">
        <Heading size="large" level="h2">
          Logo / Colors
        </Heading>
        <form className="Theme__form" onSubmit={this.save}>
          <FormLabel afterLabel="Use whitelabel branding">
            <FormCheckbox
              checked={this.isWhiteLabelEnabled()}
              onChange={this.toggleWhiteLabelEnabled}
            />
          </FormLabel>
          {this.isWhiteLabelEnabled() && (
            <div>
              <div className="Theme__section">
                <FormLabel
                  label="Upload logo for light theme (.svg only)"
                  className="Theme__field"
                  vertical>
                  <FormFile
                    readAs="text"
                    accept=".svg"
                    onChange={this.setLightThemeLogo}
                  />
                </FormLabel>
                <div className="Theme__logo-preview-container">
                  <div className="Theme__logo-preview Theme__logo-preview--light">
                    <img
                      className="Theme__logo"
                      height="30"
                      src={`data:image/svg+xml;utf8,${this.state.lightLogo}`}
                      alt={`Preview of light mode logo`}
                    />
                  </div>
                </div>
                <FormLabel
                  className="Theme__field"
                  label="Upload logo for dark theme (.svg only)"
                  vertical>
                  <FormFile
                    readAs="text"
                    accept=".svg"
                    onChange={this.setDarkThemeLogo}
                  />
                </FormLabel>
                <div className="Theme__logo-preview-container">
                  <div className="Theme__logo-preview Theme__logo-preview--dark">
                    <img
                      className="Theme__logo"
                      height="30"
                      src={`data:image/svg+xml;utf8,${this.state.darkLogo}`}
                      alt={`Preview of dark mode logo`}
                    />
                  </div>
                </div>
              </div>
              <FormLabel label="Key Color - Hex" vertical>
                <FormInput
                  type="color"
                  error={isColorValid === false}
                  onChange={this.setColor}
                  value={keyColor}
                />
                {isColorValid === false && (
                  <div className="Theme__color-error">
                    A valid color is a hex value prefixed with a "#" symboled
                    followed by six digits that are 0-9 and the letters a-f,
                    e.g. #af091e
                  </div>
                )}
              </FormLabel>

              <Heading size="large" level="h2">
                Help Links
              </Heading>
              <div className="Theme__section">
                <FormLabel label="Tutorials" className="Theme__field" vertical>
                  <FormInput
                    value={tutorialUrl}
                    onChange={this.setTutorialUrl}
                  />
                </FormLabel>
                <FormLabel
                  label="Release Notes"
                  className="Theme__field"
                  vertical>
                  <FormInput
                    value={releaseNotesUrl}
                    onChange={this.setReleaseNotesUrl}
                  />
                </FormLabel>
                <FormLabel label="FAQ" className="Theme__field" vertical>
                  <FormInput value={faqUrl} onChange={this.setFaqUrl} />
                </FormLabel>
                <FormLabel
                  label="Support Form"
                  className="Theme__field"
                  vertical>
                  <FormInput value={supportUrl} onChange={this.setSupportUrl} />
                </FormLabel>
              </div>
            </div>
          )}
          <FormButton
            type="submit"
            state={this.getSubmitState()}
            disabled={this.hasErrors()}>
            Apply Brand Options
          </FormButton>
        </form>
      </div>
    )
  }
}
