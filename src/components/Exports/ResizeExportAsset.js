import React, { Component, PropTypes } from 'react'
import { FormLabel, FormInput } from '../Form'

export default class ResizeExportAsset extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    defaultSize: PropTypes.number.isRequired,
  }

  state = {
    size: this.props.defaultSize,
  }

  onChange = size => {
    this.setState(
      {
        size,
      },
      () => {
        this.props.onChange(this.state.size)
      },
    )
  }

  render() {
    return (
      <FormLabel
        vertical
        label="Resize assets"
        className="Exports__form-element Exports__form-element--nested">
        <div className="Exports__form-help">
          <FormInput
            value={this.state.size}
            inlineReset
            className="Exports__form-input"
            onChange={this.onChange}
          />
          <div className="Exports__form-help-label">Max Pixels</div>
        </div>
      </FormLabel>
    )
  }
}
