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
    // alert(this.state.text + ' by ' + this.props.user.email)
    // this.props.actions.hideModal()

    const { user } = this.props

    const emailBlob = {
      to_name: "Zorroa Support",
      to_email: SUPPORT_ADDRESS,
      from_name: `${user.firstName} ${user.lastName}`,
      from_email: this.props.user.email,
      reply_to: this.props.user.email,
      subject: "help",
      message: this.state.text
    }

    console.log(emailBlob)

    this.setState({ sendState: SENDING })

    // parameters: service_id, template_id, template_parameters
    emailjs.send("default_service","template_4EvEfQML", emailBlob)
    .then((response) => {
      // console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
      this.setState({ sendState: SENT })
    }, (err) => {
      this.setState({ sendState: SENDERROR })
      // console.log("FAILED. error=", err);
    });

    // var start = () => {
    //   // Initializes the client with the API key and the Translate API.
    //   gapi.client.init({
    //     'client_id': '582965223173-p4mq3gctkf7pfh50lv4c9vful1irakmt.apps.googleusercontent.com',
    //     'apiKey': 'AIzaSyCMRftKq-tEFZ6ZBsb3q4msScFhhAW6ZBA',
    //     'discoveryDocs': ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
    //     // https://developers.google.com/gmail/api/auth/scopes
    //     // https://www.googleapis.com/auth/gmail.send: Send messages only. No read or modify privileges on mailbox.
    //     'scope': 'https://www.googleapis.com/auth/gmail.send'
    //   })
    //   .then(response => {
    //     const email = 'To: zorroafeedback@gmail.com\r\n' + this.state.text
    //     const emailEncoded = window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_')

    //     var sendRequest = gapi.client.gmail.users.messages.send({
    //       'userId': 'me',
    //       'resource': { 'raw': emailEncoded }
    //     });
    //     return new Promise(resolve => sendRequest.execute(resolve))
    //   },
    //     error => { console.error(error) }
    //   )
    //   .then(
    //     response => { console.log(response) },
    //     error => { console.error(error) }
    //   )
    // };

    // // Loads the JavaScript client library and invokes `start` afterwards.
    // gapi.load('client', start);
  }

  render () {
    const { user } = this.props
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
        { (sendState == EDITING) && (
          <div className="Feedback-body">
            <span>Enter a question or note here, and we will get back to you asap.
            If you prefer, you can email <a href={`mailto:${SUPPORT_ADDRESS}?Subject=Zorroa%20support%20request`} target="_top">{SUPPORT_ADDRESS}</a> directly.</span>
            <textarea className="Feedback-text" type="text" rows="5"  value={this.state.name} onChange={this.updateText}/>
          </div>
        )}
        { (sendState == SENDING) && (
          <div className="Feedback-body">
            <span>Sending feedback to Zorroa Support...</span>
          </div>
        )}
        { (sendState == SENT) && (
          <div className="Feedback-body">
            <span>Feedback sent. Thank you! We will get back to you as soon as we can.</span>
          </div>
        )}
        { (sendState == SENDERROR) && (
          <div className="Feedback-body">
            <span>
              Sorry, something went wrong emailing support.
              Please try again later or
              email <a href={`mailto:${SUPPORT_ADDRESS}?Subject=Zorroa%20support%20request`} target="_top">{SUPPORT_ADDRESS}</a> directly.
            </span>
          </div>
        )}

        { (sendState == EDITING) && (
          <div className="Feedback-footer">
            <button className="Feedback-send default" onClick={this.send}>Send</button>
            <button className="Feedback-cancel" onClick={this.dismiss}>Cancel</button>
          </div>
        )}
        { (sendState != EDITING) && (
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
