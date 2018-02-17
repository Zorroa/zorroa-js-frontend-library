import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import { updateExportInterface } from '../../actions/exportsAction'
import Heading from '../Heading'
import {
  FormInput,
  FormLabel
} from '../Form'
import ExportsSection from './ExportsSection'
import ExportInformation from './ExportInformation'
import ImageAssets from './ImageAssets'

class Exports extends Component {
  static propTypes = {
    name: PropTypes.string,
    actions: PropTypes.shape({
      updateExportInterface: PropTypes.func.isRequired
    })
  }

  state = {
    // Form fields
    exportPackageName: this.props.name || 'My Exports__type',
    exportPackageProfile: undefined,
    accordions: {}
  }

  close = () => {
    this.props.actions.updateExportInterface({
      shouldShow: false
    })
  }

  onSubmit = event => {
    event.preventDefault()
    console.log(event)
  }

  onChange = newState => {
    event.preventDefault()
    console.log(event)
    this.setState(newState)
  }

  onToggle = ({isOpen, key}) => {
    this.setState(prevState => ({
      accordions: {
        ...prevState.accordions,
        [key]: isOpen
      }
    }))
  }

  render () {
    const body = (
      <div className="Exports">
        <ModalHeader icon="icon-export" closeFn={this.close}>
          Create Export
        </ModalHeader>
        <form onSubmit={this.onSubmit} className="Exports__body">
          <div className="Exports__sidebar">
            <ExportInformation />
            <ImageAssets />
          </div>
          <div className="Exports__mainbar">
            <section className="Exports__type-section">
              <Heading>Export Information</Heading>
            </section>
          </div>
        </form>
      </div>
    )

    return (
      <div className="Exports">
        <Modal
          onModalUnderlayClick={this.close}
          body={body}
          width={'80vw'}
        />
      </div>
    )
  }
}

export default connect(state => ({
  shouldShow: state.exports.shouldShow
}), dispatch => ({
  actions: bindActionCreators({
    updateExportInterface
  }, dispatch)
}))(Exports)
