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
            <ExportsSection
              title="Export Information"
              onToggle={this.onToggle}
              isOpen={!!this.state.accordions.exportInformation}
              id="exportInformation"
            >
              <FormLabel vertical label="Export Package Name" className="Exports__form-element">
                <FormInput
                  required
                  value = { this.state.exportPackageName }
                  type="text"
                  onChange = { exportPackageName => { this.onChange({exportPackageName}) } }
                />
              </FormLabel>
              <FormLabel vertical label="Load Export Profile" className="Exports__form-element">
                <FormInput
                  required
                  value = { this.state.exportProfile }
                  type="text"
                  onChange = { exportProfile => { this.onChange({exportProfile}) } }
                />
              </FormLabel>
            </ExportsSection>
            <ExportsSection
              title="Image Assets"
              onToggle={this.onToggle}
              isOpen={!!this.state.accordions.imageAssets}
              id="imageAssets"
            >
              <FormLabel vertical label="Export Original Assets" className="Exports__form-element">
                <FormInput
                  required
                  value = { this.state.imageAssets }
                  type="text"
                  onChange = { exportPackageName => { this.onChange({exportPackageName}) } }
                />
              </FormLabel>
              <FormLabel vertical label="Exports Assets As" className="Exports__form-element">
                <FormInput
                  required
                  value = { this.state.imageAssets }
                  type="text"
                  onChange = { exportProfile => { this.onChange({exportProfile}) } }
                />
              </FormLabel>
            </ExportsSection>
            <fieldset className="Exports__field-group">
              <Heading>
                Export Information
              </Heading>
            </fieldset>
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
