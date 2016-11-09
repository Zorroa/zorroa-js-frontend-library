import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { createFolder } from '../../actions/folderAction'

class CreateFolder extends Component {
  static propTypes = {
    isIconified: PropTypes.bool.isRequired,
    parentId: PropTypes.number,
    actions: PropTypes.object.isRequired
  }

  state = { name: '', showForm: false }

  changeName (event) {
    this.setState({ ...this.state, name: event.target.value })
  }

  submitName (event) {
    if (event.key === 'Enter' && this.state.name && this.state.name.length && this.props.parentId) {
      this.props.actions.createFolder(this.state.name, this.props.parentId)
      this.hideForm(event)
    } else if (event.key === 'Escape') {
      this.hideForm(event)
    }
  }

  showForm (event) {
    this.setState({ ...this.state, showForm: true })
  }

  hideForm (event) {
    this.setState({ ...this.state, showForm: false })
  }

  render () {
    return (
      <div className="CreateFolder flexRow flexAlignItemsCenter">
        <button disabled={!this.props.parentId} onClick={this.showForm.bind(this)}><span className="icon-plus-square"/>&nbsp;New Folder</button>
        { this.state.showForm && this.props.parentId && (
          <div>
            <div className="CreateFolder-background" />
            <div className="CreateFolder-form flexRow flexAlignItemsCenter">
              <div>New Folder Name</div>
              <input autoFocus={true} type="text" placeholder="Name" onKeyDown={this.submitName.bind(this)} onChange={this.changeName.bind(this)} />
              <button onClick={this.hideForm.bind(this)} className="icon-cross"/>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default connect(null, dispatch => ({
  actions: bindActionCreators({ createFolder }, dispatch)
}))(CreateFolder)
