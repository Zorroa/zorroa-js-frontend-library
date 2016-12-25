import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { getAssetFields } from '../../actions/assetsAction'
import { hideModal, syncMetadataAndTableFields } from '../../actions/appActions'
import { unCamelCase } from '../../services/jsUtil'

class DisplayOptions extends Component {
  static propTypes = {
    selectedFields: PropTypes.arrayOf(PropTypes.string).isRequired, // Pre-selected fields
    onDismiss: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    singleSelection: PropTypes.bool,                  // true forces radio mode
    title: PropTypes.string.isRequired,               // E.g. 'Metadata Display Options'
    syncLabel: PropTypes.string,                      // Opposite of title, e.g. 'Table'
    fieldTypes: PropTypes.arrayOf(PropTypes.string),  // Optional list of types, e.g. ['point']
    fields: PropTypes.object,                         // state.assets.fields
    syncMetadataAndTable: PropTypes.bool,             // state.app.syncMetadataAndTable
    actions: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {
      openedNamespace: '',                            // E.g. Foo.bar
      checkedNamespaces: this.props.selectedFields,   // Array of field names
      syncedViews: this.props.syncMetadataAndTable,   // Checkbox state
      fieldFilter: ''                                 // Filter input state
    }
  }

  componentWillMount () {
    this.props.actions.getAssetFields()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.syncMetadataAndTable) {
      this.setState({ syncedViews: nextProps.syncMetadataAndTable })
    }
  }

  // Update clicked, invoked callbacks to apply state and dismiss
  update (event) {
    this.props.onUpdate(event, this.state)
    if (this.state.syncedViews !== this.props.syncMetadataAndTable) {
      this.props.actions.syncMetadataAndTableFields(this.state.syncedViews)
    }
    this.cancel(event)
  }

  // Cancel or close clicked, dismiss without update
  cancel (event) {
    this.props.actions.hideModal()
    if (this.props.onDismiss) {
      this.props.onDismiss(event)
    }
  }

  filter = (event) => {
    const fieldFilter = event.target.value ? event.target.value : ''
    this.setState({ fieldFilter })
  }

  viewAllMetadata = () => {
    // FIXME: Link to metadata?
  }

  // Unfold the namespace to show children
  openNamespace (openedNamespace) {
    this.setState({ openedNamespace })
  }

  // Select the namespace and update state.checkedNamespaces
  toggleNamespace (namespace) {
    const index = this.state.checkedNamespaces.indexOf(namespace)
    let checkedNamespaces = [ ...this.state.checkedNamespaces ]
    if (index >= 0) {
      checkedNamespaces.splice(index, 1)
    } else if (this.props.singleSelection) {
      checkedNamespaces = [namespace]
    } else {
      const names = this.namesForNamespace(namespace)
      if (!names || names.length === 0) {
        // Clicked on a leaf node, add it to the checked list
        checkedNamespaces.push(namespace)
      } else {
        // Clicked on a parent node, either select or deselect all children
        const state = this.parentState(namespace, this.allChildCounts())
        this.allFields().forEach(field => {
          if (field.startsWith(namespace)) {
            const index = checkedNamespaces.indexOf(field)
            if (state === 'ON' && index >= 0) {
              checkedNamespaces.splice(index, 1)
            } else if (state !== 'ON' && index < 0) {
              checkedNamespaces.push(field)
            }
          }
        })
      }
    }
    this.setState({ checkedNamespaces })
  }

  // Update the state of the syncView toggle
  syncViews = (event) => {
    this.setState({ syncedViews: event.target.checked })
  }

  toggleSync = (event) => {
    this.setState({ syncedViews: !this.state.syncedViews })
  }

  // Return the field names for the specified namespace
  namesForNamespace (namespace) {
    let names = new Set()
    const { openedNamepsace, fieldFilter } = this.state
    const length = namespace ? namespace.length : 0
    const lcFieldFilter = fieldFilter.toLowerCase()
    this.allFields().forEach(field => {
      if ((!length || field.startsWith(namespace)) &&
        (!length || (field.length > length && field[length] === '.')) &&
        (field.startsWith(openedNamepsace) ||       // always show selected
        !lcFieldFilter.length || field.toLowerCase().includes(lcFieldFilter))) {
        // Strip off the prefix and slice off any tail past the next dot
        const tail = field.slice(length ? length + 1 : 0)
        const index = tail.indexOf('.')
        const name = index >= 0 ? tail.slice(0, index) : tail
        if (name.length) {
          names.add(name)
        }
      }
    })
    return [ ...names ]
  }

  // Fields only change during an active server import.
  // We could optimize this by storing the result statically,
  // if we knew how to flush the cache during an import.
  allFields () {
    const { fields, fieldTypes } = this.props
    const allFields = []
    for (let key in fields) {
      if (fieldTypes && fieldTypes.indexOf(key) < 0) {
        continue
      }
      const typeFields = fields[key]
      for (let field of typeFields) {
        allFields.push(field)
      }
    }
    return allFields
  }

  // Count the number of children for each parent namespace.
  // Parent checkbox state counts number of selected children.
  allChildCounts () {
    const counts = {}
    this.allFields().forEach(field => {
      const parents = field.split('.')
      for (let i = 0; i < parents.length - 1; ++i) {
        const namespace = parents.slice(0, i + 1).join('.')
        counts[namespace] = counts[namespace] ? counts[namespace] + 1 : 1
      }
    })
    return counts
  }

  // Count the number of currently selected children of this namespace
  checkedChildren (namespace) {
    let count = 0
    const { checkedNamespaces } = this.state
    for (let name of checkedNamespaces) {
      if (name.startsWith(namespace)) {
        count++
      }
    }
    return count
  }

  // Compare the currently checked child count against the total child count
  parentState (namespace, childCounts) {
    const count = this.checkedChildren(namespace)
    if (count === 0) {
      return 'OFF'
    } else if (count >= childCounts[namespace]) {
      return 'ON'
    }
    return 'MIXED'
  }

  // For the field Foo.bar.Bam, the arguments would be:
  //   name = Bam
  //   namespace = Foo.bar
  //   childCounts is a precomputed version of this.allChildCounts
  renderName (name, namespace, childCounts) {
    const { singleSelection } = this.props
    const { openedNamespace } = this.state
    const key = namespace && namespace.length ? namespace + '.' + name : name
    const hasChildren = this.namesForNamespace(key).length > 0
    const selected = openedNamespace.startsWith(key)
    const disable = hasChildren && this.state.openedNamespace && namespace !== openedNamespace
    const parentState = hasChildren ? this.parentState(key, childCounts) : 'NONE'
    const checked = parentState === 'ON' || this.state.checkedNamespaces.indexOf(key) >= 0
    const checkable = !singleSelection || !hasChildren
    const indeterminate = parentState === 'MIXED'
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
    const { openedNamespace, fieldFilter } = this.state
    const { title, syncLabel, singleSelection, fieldTypes } = this.props
    const names = this.namesForNamespace()
    const childCounts = this.allChildCounts()
    const disabled = (singleSelection && this.state.checkedNamespaces.length !== 1) || (!names || names.length === 0)
    const openedNamespaces = openedNamespace && openedNamespace.length ? openedNamespace.split('.') : []
    return (
      <div>
        <div className="DisplayOptions-background" />
        <div className="DisplayOptions flexCol">
          <div className="DisplayOptions-header">
            <div className="DisplayOptions-settings icon-cog"/>
            <div className="DisplayOptions-title">{title}</div>
            <div className="flexOn"/>
            { syncLabel && (
              <label className="flexOff switch">
                <input type="checkbox" checked={this.state.syncedViews} onChange={this.syncViews} />
                <div className="slider round"/>
              </label>
            )}
            { syncLabel && (
              <div className="DisplayOptions-sync" onClick={this.toggleSync}>Sync with {syncLabel} View</div>
            )}
            <div className="DisplayOptions-close icon-cross2" onClick={this.cancel.bind(this)}/>
          </div>
          <div className="DisplayOptions-subheader flexRow flexAlignItemsEnd">
            <input type="text" onChange={this.filter} value={fieldFilter} placeholder="Filter Fields" />
            <button className="icon-search" />
            <button onClick={this.viewAllMetadata} className="DisplayOptions-subheader-viewall">View All Metadata<span className="icon-new-tab"/> </button>
          </div>
          <div className="DisplayOptions-body fullWidth flexRow flexOn">

            {/* Always show the first level namespaces */}
            <div className="DisplayOptions-body-col flexCol">
              { (names && names.length) || !fieldTypes ? (
                names.map(name => (this.renderName(name, null, childCounts)))
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

            { /* Iterate over child namespaces, if something is opened */ }
            { openedNamespaces.map((name, i) => {
              const namespace = openedNamespaces.slice(0, i + 1).join('.')
              return (
                <div key={i} className="DisplayOptions-body-col flexCol">
                  { this.namesForNamespace(namespace).map(name => (this.renderName(name, namespace, childCounts))) }
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
  fields: state.assets.fields,
  syncMetadataAndTable: state.app.syncMetadataAndTable
}), dispatch => ({
  actions: bindActionCreators({
    getAssetFields,
    hideModal,
    syncMetadataAndTableFields }, dispatch)
}))(DisplayOptions)
