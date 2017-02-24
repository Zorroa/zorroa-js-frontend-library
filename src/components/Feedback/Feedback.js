import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'
import User from '../../models/User'

const EDITING = 1
const SENDING = 2
const SENT = 3
const SENDERROR = 4

const SUPPORT_ADDRESS = 'support@zorroa.com'

class Feedback extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(User),
    actions: PropTypes.object
  }

  state = {
    text: '',
    sendState: EDITING
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
    emailjs.send('default_service', 'template_4EvEfQML', emailBlob)
    .then(
      (response) => {
        // console.log("SUCCESS. status=%d, text=%s", response.status, response.text)
        this.setState({ sendState: SENT })
      },
      (reason) => {
        // console.log("FAILED. error=", reason)
        this.setState({ sendState: SENDERROR })
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
