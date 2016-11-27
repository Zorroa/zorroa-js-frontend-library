import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { hideModal } from '../../actions/appActions'

class CreateExport extends Component {
  static propTypes = {
    onCreate: PropTypes.func.isRequired,
    onDismiss: PropTypes.func,
    actions: PropTypes.object
  }

  state = {
    name: '',
    exportImages: true,
    exportTable: true
  }

  changeName = (event) => {
    this.setState({name: event.target.value})
  }

  checkForSubmit = (event) => {
    if (event.key === 'Enter' && this.state.name && this.state.name.length) {
      this.create(event)
    } else if (event.key === 'Escape') {
      this.dismiss()
    }
  }

  toggleExportImages = (event) => {
    this.setState({exportImages: event.target.checked})
  }

  toggleExportTable = (event) => {
    this.setState({exportTable: event.target.checked})
  }

  create = (event) => {
    const {name, exportImages, exportTables} = this.state
    this.props.onCreate(event, name, exportImages, exportTables)
    this.dismiss(event)
  }

  dismiss = (event) => {
    const { onDismiss } = this.props
    if (onDismiss) onDismiss(event)
    this.props.actions.hideModal()
  }

  render () {
    return (
      <div className="CreateExport">
        <div className="header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="icon-plus-square"/>
            <div>Create Export</div>
          </div>
          <div onClick={this.dismiss} className="icon-cross2"/>
        </div>
        <div className="body flexCol">
          <input type="text" value={this.state.name} placeholder="Name" onChange={this.changeName} onKeyDown={this.checkForSubmit} />
          <div className="option-row">
            <input disabled={true} type="checkbox" checked={this.state.exportImages} onChange={this.toggleExportImages} />
            <div>Export source images (TBD)</div>
          </div>
          <div className="option-row">
            <input disabled={true} type="checkbox" checked={this.state.exportTable} onChange={this.toggleExportTable} />
            <div>Export metadata table (TBD)</div>
          </div>
        </div>
        <div className="footer">
          <button onClick={this.create} className="default">Create</button>
          <button onClick={this.dismiss}>Cancel</button>
        </div>
      </div>
    )
  }
}

export default connect(state => ({}), dispatch => ({
  actions: bindActionCreators({ hideModal }, dispatch)
}))(CreateExport)
