import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

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
    exportTable: true,
    exportContactSheet: false
  }

  changeName = (event) => {
    this.setState({name: event.target.value})
  }

  clearName = (event) => {
    this.setState({ name: '' })
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

  toggleExportContactSheet = (event) => {
    this.setState({exportContactSheet: event.target.checked})
  }

  create = (event) => {
    const {name, exportImages, exportTable} = this.state
    this.props.onCreate(event, name, exportImages, exportTable)
    this.dismiss(event)
  }

  dismiss = (event) => {
    const { onDismiss } = this.props
    if (onDismiss) onDismiss(event)
    this.props.actions.hideModal()
  }

  render () {
    const isDisabled = !this.state.name.length
    return (
      <div className="CreateExport">
        <div className="header">
          <div className="flexRow flexAlignItemsCenter">
            <div className="CreateExport-icon icon-export"/>
            <div>Create Export Package</div>
          </div>
          <div onClick={this.dismiss} className="CreateExport-close icon-cross"/>
        </div>
        <div className="body flexCol">
          <div className="CreateExport-package-label">Export package name</div>
          <div className="CreateExport-package-name">
            <input type="text" value={this.state.name} placeholder="Name" onChange={this.changeName} onKeyDown={this.checkForSubmit}/>
            <div onClick={this.clearName} className="CreateExport-package-name-cancel icon-cancel-circle"/>
          </div>
          <div className="option-row">
            <input type="checkbox" checked={this.state.exportImages} onChange={this.toggleExportImages} />
            <div className="CreateExport-input-label">
              <div className="CreateExport-input-text">Export original assets.</div>
              <div className="CreateExport-subtext">Full size, original file type.</div>
            </div>
            </div>
          <div className="option-row">
            <input type="checkbox" checked={this.state.exportTable} onChange={this.toggleExportTable} />
            <div className="CreateExport-input-label">
              <div className="CreateExport-input-text">Export current metadata table</div>
              <div className="CreateExport-subtext">CSV file type.</div>
            </div>
          </div>
          <div className="option-row">
            <input disabled={true} type="checkbox" checked={this.state.exportContactSheet} onChange={this.toggleExportContactSheet} />
            <div className="CreateExport-input-label">
              <div className="CreateExport-input-text">Export contact sheet (TBD)</div>
              <div className="CreateExport-subtext">Grid view.</div>
            </div>
          </div>
        </div>
        <div className="footer">
          <button onClick={!isDisabled && this.create} className={classnames('default', {isDisabled})}>Start Package</button>
          <button onClick={this.dismiss}>Cancel</button>
        </div>
      </div>
    )
  }
}

export default connect(state => ({}), dispatch => ({
  actions: bindActionCreators({ hideModal }, dispatch)
}))(CreateExport)
