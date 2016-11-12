import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { getAssetFields } from '../../actions/assetsAction'
import { unCamelCase } from '../../services/jsUtil'

class DisplayOptions extends Component {
  static propTypes = {
    selectedFields: PropTypes.arrayOf(PropTypes.string).isRequired,
    onDismiss: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    singleSelection: PropTypes.bool,
    title: PropTypes.string.isRequired,
    syncLabel: PropTypes.string,
    fieldTypes: PropTypes.arrayOf(PropTypes.string),
    fields: PropTypes.object,
    actions: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = { openedNamespace: '', checkedNamespaces: this.props.selectedFields, syncedViews: false }
  }

  componentWillMount () {
    this.props.actions.getAssetFields()
  }

  // Update clicked, invoked callbacks to apply state and dismiss
  update (event) {
    this.props.onUpdate(event, this.state)
    this.props.onDismiss(event)
  }

  // Cancel or close clicked, dismiss without update
  cancel (event) {
    this.props.onDismiss(event)
  }

  // FIXME: Implement field search
  search (event) {
    console.log('Search')
  }

  // FIXME: Implement view all
  viewAllMetadata (event) {
    console.log('View all')
  }

  // Unfold the namespace to show children
  openNamespace (openedNamespace) {
    this.setState({ ...this.state, openedNamespace })
  }

  // Select the namespace and update state.checkedNamespaces
  // FIXME: Recursively toggle children
  toggleNamespace (namespace) {
    console.log('Toggle namespace ' + namespace)
    const index = this.state.checkedNamespaces.indexOf(namespace)
    let checkedNamespaces = [ ...this.state.checkedNamespaces ]
    if (index >= 0) {
      checkedNamespaces.splice(index, 1)
    } else if (this.props.singleSelection) {
      checkedNamespaces = [namespace]
    } else {
      checkedNamespaces.push(namespace)
    }
    this.setState({ ...this.state, checkedNamespaces })
  }

  // Update the state of the syncView toggle
  syncViews (event) {
    this.setState({ ...this.state, syncedViews: event.target.checked })
  }

  // Return the field names for the specified namespace
  namesForNamespace (namespace) {
    let names = new Set()
    const { fields, fieldTypes } = this.props
    const length = namespace ? namespace.length : 0
    for (let key in fields) {
      if (fieldTypes && fieldTypes.indexOf(key) < 0) {
        continue
      }
      const typeFields = fields[key]
      for (let field of typeFields) {
        if (!length || field.startsWith(namespace)) {
          // Strip off the prefix and slice off any tail past the next dot
          const tail = field.slice(length ? length + 1 : 0)
          const index = tail.indexOf('.')
          const name = index >= 0 ? tail.slice(0, index) : tail
          if (name.length) {
            names.add(name)
          }
        }
      }
    }
    return [ ...names ]
  }

  // Compuute the indeterminate state by checking child fields
  isSomethingUnderneathChecked (namespace) {
    const { checkedNamespaces } = this.state
    for (let n of checkedNamespaces) {
      if (n.length > namespace.length && n.startsWith(namespace)) {
        return true
      }
    }
    return false
  }

  renderName (name, namespace) {
    const { singleSelection } = this.props
    const key = namespace && namespace.length ? namespace + '.' + name : name
    const hasChildren = this.namesForNamespace(key).length > 0
    const selected = this.state.openedNamespace.startsWith(key)
    const disable = hasChildren && this.state.openedNamespace && namespace !== this.state.openedNamespace
    const checked = this.state.checkedNamespaces.indexOf(key) >= 0
    const checkable = !singleSelection || !hasChildren
    const indeterminate = !checked && this.isSomethingUnderneathChecked(key)
    const classname = classnames('DisplayOptions-namespace', 'flexRow',
      'flexJustifySpaceBetween', 'flexAlignItemsCenter',
      { selected: selected, disable: disable, hasChildren: hasChildren })
    return (
      <div key={key} onClick={hasChildren && this.openNamespace.bind(this, key)} className={classname}>
        <div>
          { checkable &&
          <input checked={checked} type="checkbox"
                 className={classnames({indeterminate})} id={key} name={key}
                 onChange={this.toggleNamespace.bind(this, key)}/>
          }
          <label htmlFor={key}><span/>{unCamelCase(name)}</label>
        </div>
        { hasChildren && <div className={classnames('DisplayOptions-namespace', 'childArrow', 'icon-arrow-down2', { selected: selected })} /> }
      </div>
    )
  }

  render () {
    const { openedNamespace } = this.state
    const { title, syncLabel, singleSelection, fieldTypes } = this.props
    const names = this.namesForNamespace()
    const disabled = (singleSelection && this.state.checkedNamespaces.length !== 1) || (!names || names.length === 0)
    const openedNamespaces = openedNamespace && openedNamespace.length ? openedNamespace.split('.') : []
    return (
      <div>
        <div className="DisplayOptions-background" />
        <div className="DisplayOptions flexCol">
          <div className="DisplayOptions-header flexRow flexAlignItemsCenter flexJustifySpaceBetween fullWidth">
            <div className="flexRow flexAlignItemsCenter">
              <span className="icon-cog"/>
              <div className="DisplayOptions-title">{title}</div>
            </div>
            { syncLabel && (
              <div className="flexRow flexAlignItemsCenter">
                <label className="switch">
                  <input type="checkbox" checked={this.state.syncedViews} onChange={this.syncViews.bind(this)} />
                  <div className="slider round"/>
                </label>
                <div className="DisplayOptions-sync">Sync with {syncLabel} View</div>
                <span onClick={this.cancel.bind(this)} className="icon-cross2" />
              </div>
            )}
          </div>
          <div className="DisplayOptions-subheader flexRow flexAlignItemsEnd">
            <input type="text" />
            <button onClick={this.search.bind(this)} className="icon-search" />
            <button onClick={this.viewAllMetadata(this)} className="DisplayOptions-subheader-viewall">View All Metadata<span className="icon-new-tab"/> </button>
          </div>
          <div className="DisplayOptions-body fullWidth flexRow flexOn">
            <div className="DisplayOptions-body-col flexCol">
              { (names && names.length) || !fieldTypes ? (
                names.map(name => (this.renderName(name)))
              ) : (
                <div className="DisplayOptions-body-empty flexCol flexAlignItemsCenter">
                  <div className="icon-thumbs-up" />
                  <div>No fields match the required types:</div>
                  <div className="flexRow">
                    { fieldTypes.map(type => (<div key={type} className="DisplayOptions-body-field-type">{type}</div>)) }
                  </div>
                </div>
              ) }
            </div>
            { openedNamespaces.map((name, i) => {
              const namespace = openedNamespaces.slice(0, i + 1).join('.')
              return (
                <div key={i} className="DisplayOptions-body-col flexCol">
                  { this.namesForNamespace(namespace).map(name => (this.renderName(name, namespace))) }
                </div>
              )
            })}
          </div>
          <div className="DisplayOptions-footer flexRow fullWidth flexJustifyCenter">
            <button className={classnames('default', { disabled })} onClick={!disabled && this.update.bind(this)}>Update</button>
            <button onClick={this.cancel.bind(this)}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  fields: state.assets.fields
}), dispatch => ({
  actions: bindActionCreators({ getAssetFields }, dispatch)
}))(DisplayOptions)
