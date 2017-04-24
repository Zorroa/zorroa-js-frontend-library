import React, { Component, PropTypes } from 'react'

import AclEditor from '../AclEditor'

export default class AssetPermissions extends Component {
  static propTypes = {
    onApply: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired
  }

  state = {
    acl: null
  }

  changeAcl = (acl) => {
    this.setState({acl})
  }

  setPermissions = (event) => {
    const { acl } = this.state
    this.props.onApply(acl)
  }

  cancel = (event) => {
    this.props.onCancel()
  }

  render () {
    const { title } = this.props
    return (
      <div className="AssetPermissions">
        <div className="AssetPermissions-header">
          <div className="AssetPermissions-title">{title}</div>
          <div className="icon-cross2" onClick={this.cancel}/>
        </div>
        <div className="AssetPermissions-body">
          <AclEditor onChange={this.changeAcl}/>
        </div>
        <div className="AssetPermissions-controls">
          <div className="AssetPermissions-apply" onClick={this.setPermissions}>Save</div>
          <div className="AssetPermissions-cancel" onClick={this.cancel}>Cancel</div>
        </div>
      </div>
    )
  }
}
