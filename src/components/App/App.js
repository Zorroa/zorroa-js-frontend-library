import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Modal from '../Modal'
import Logo from '../Logo'
import { updateModal } from '../../actions/appActions'

class App extends Component {
  static get propTypes () {
    return {
      updateModal: PropTypes.func.isRequired,
      children: PropTypes.object,
      modal: PropTypes.object
    }
  }

  constructor (props) {
    super(props)
    this.dismissModal = this.dismissModal.bind(this)
  }

  componentDidMount () {
    /*
    // Example usage of opening a modal
    this.props.updateModal({
      title: 'test',
      content: (<Logo />),
      footer: (
        <div>
          <button className="zorroa-btn">Footer button</button>
        </div>
      )
    })
    */
  }

  dismissModal () {
    this.props.updateModal({})
  }

  render () {
    const {modal, children} = this.props

    return (
      <div>
        {this.renderModal(modal)}
        {children}
      </div>
    )
  }

  renderModal (modal) {
    if (!modal) {
      return false
    }

    const { title, content, children, footer } = modal

    return (
      <Modal title={title} content={content} dismiss={this.dismissModal} footer={footer}>{children}</Modal>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    updateModal
  }, dispatch)
}

function mapStateToProps (state) {
  console.info(state)
  return {
    modal: state.app.modal
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
