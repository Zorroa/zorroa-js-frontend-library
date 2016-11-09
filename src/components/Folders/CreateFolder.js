import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { createFolder } from '../../actions/folderAction'

class CreateFolder extends Component {
  static propTypes = {
    parentId: PropTypes.number,
    actions: PropTypes.object.isRequired
  }

  constructor (props) {
    super(props)

    // be careful to allow a parent id of 0 (Folder.ROOT_ID)
    this.parentIdValid = (typeof props.parentId === 'number') && (props.parentId >= 0)
  }

  state = { name: '', showForm: false }

  changeName (event) {
    this.setState({ ...this.state, name: event.target.value })
  }

  submitName (event) {
    if (event.key === 'Enter' && this.state.name && this.state.name.length && this.parentIdValid) {
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
        <button disabled={!this.parentIdValid} onClick={this.showForm.bind(this)}><span className="icon-plus-square"/>&nbsp;New</button>
        { this.state.showForm && this.parentIdValid && (
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
