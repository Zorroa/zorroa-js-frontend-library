import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'
import User from '../../models/User'

const EDITING = 1
const SENDING = 2
const SENT = 3
const SENDERROR = 4
const OUT_OF_ORDER = 5

const SUPPORT_ADDRESS = 'support@zorroa.com'

class Feedback extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    actions: PropTypes.object
  }

  static loadEmailJs = () => {
    // Use of globals here to make this a singleton:
    // - avoid re-running this code even on Workspace unmount/remount
    // - make this function dependency-free; no actions or app state
    if (window.zorroaEmailJSLoadAttempted) return
    window.zorroaEmailJSLoadAttempted = true

    // http://stackoverflow.com/a/7719185/1424242
    var loadScript = (src) => {
      return new Promise(function (resolve, reject) {
        var s
        s = document.createElement('script')
        s.src = src
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
    }

    // wait for above-the-fold loads to finish
    new Promise(resolve => setTimeout(resolve, 1000))
    .then(() => loadScript('https://cdn.emailjs.com/dist/email.min.js'))
    // emailjs needs a moment to init before window.emailjs will be defined
    .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
    .then(() => window.emailjs.init('user_WBcDrP5QF9DWgdWTE6DvB'))
    .catch(err => console.error('Zorroa email js', err))
  }

  state = {
    text: '',
    sendState: window.emailjs ? EDITING : OUT_OF_ORDER
  }

  _isMounted = false
  componentDidMount () {
    this._isMounted = true
  }
  componentWillUnmount () {
    this._isMounted = false
  }

  dismiss = (event) => {
    this.props.actions.hideModal()
  }

  updateText = (event) => {
    this.setState({text: event.target.value})
  }

  send = (event) => {
    const { user } = this.props

    // These will be injected into the email according to the template we're using.
    // See template ID in the emailjs.send() call.
    // The template can be modified in the emailjs account (credentials below), where
    // variables for injection can be added or removed as needed.
    // Note that gmail doesn't respect the sender address here, gmail will
    // replace sender name & email with the gmail account that is connect to emailjs.
    const emailBlob = {
      to_name: 'Zorroa Support',
      to_email: SUPPORT_ADDRESS,
      from_name: `${user.firstName} ${user.lastName}`,
      from_email: this.props.user.email,
      reply_to: this.props.user.email,
      subject: 'help',
      message: this.state.text
    }

    console.log(emailBlob)

    if (!window.emailjs) {
      this.setState({ sendState: OUT_OF_ORDER })
      return
    }

    this.setState({ sendState: SENDING })

    // emailjs delivers email via REST request through the account zorroafeedback@gmail.com
    // Having a separate email account for delivery makes it so emailjs doesn't have
    // access to anything Zorroa confidential other than support emails.
    //
    // emailjs username: support@zorroa.com
    // emailjs password: warabedowagenetelushabel
    //
    // zorroafeedback@gmail.com password: iongstornerfuncriacierpo
    //
    // The email template is setup manually inside the emailjs.com account
    // emailjs.send parameters: service_id, template_id, template_parameters
    //
    window.emailjs.send('default_service', 'template_4EvEfQML', emailBlob)
    .then(
      (response) => {
        // console.log("SUCCESS. status=%d, text=%s", response.status, response.text)
        if (this._isMounted) this.setState({ sendState: SENT })
      },
      (reason) => {
        // console.log("FAILED. error=", reason)
        if (this._isMounted) this.setState({ sendState: SENDERROR })
      }
    )
  }

  render () {
    const { sendState } = this.state
    return (
      <div className="Feedback">
        <div className="Feedback-header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="Feedback-icon icon-question"/>
            <div>Feedback</div>
          </div>
          <div onClick={this.dismiss} className="Feedback-close icon-cross2"/>
        </div>
        { (sendState === EDITING) && (
          <div className="Feedback-body">
            <span>Enter a question or note here, and we will get back to you asap.
            If you prefer, you can email <a href={`mailto:${SUPPORT_ADDRESS}?Subject=Zorroa%20support%20request`} target="_top">{SUPPORT_ADDRESS}</a> directly.</span>
            <textarea className="Feedback-text" type="text" rows="5" value={this.state.name} onChange={this.updateText}/>
          </div>
        )}
        { (sendState === SENDING) && (
          <div className="Feedback-body">
            <span>Sending feedback to Zorroa Support...</span>
          </div>
        )}
        { (sendState === SENT) && (
          <div className="Feedback-body">
            <span>Feedback sent. Thank you! We will get back to you as soon as we can.</span>
          </div>
        )}
        { (sendState === SENDERROR) && (
          <div className="Feedback-body">
            <span>
              Sorry, something went wrong emailing support.
              Please try again later or
              email <a href={`mailto:${SUPPORT_ADDRESS}?Subject=Zorroa%20support%20request`} target="_top">{SUPPORT_ADDRESS}</a> directly.
            </span>
          </div>
        )}
        { (sendState === OUT_OF_ORDER) && (
          <div className="Feedback-body">
            <span>
              Sorry, this feature is unavailable at this time.<br/>
              Please check your network connectivity and try again later, or
              email <a href={`mailto:${SUPPORT_ADDRESS}?Subject=Zorroa%20support%20request`} target="_top">{SUPPORT_ADDRESS}</a> directly.
            </span>
          </div>
        )}

        { (sendState === EDITING) && (
          <div className="Feedback-footer">
            <button className="Feedback-send default" onClick={this.send}>Send</button>
            <button className="Feedback-cancel" onClick={this.dismiss}>Cancel</button>
          </div>
        )}
        { (sendState !== EDITING) && (
          <div className="Feedback-footer">
            <button className="Feedback-close" onClick={this.dismiss}>Close</button>
          </div>
        )}
      </div>
    )
  }
}

export default connect(state => ({}), dispatch => ({
  actions: bindActionCreators({ hideModal }, dispatch)
}))(Feedback)
