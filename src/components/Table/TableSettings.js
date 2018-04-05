import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import Suggestions from '../Suggestions'
import TableLayoutHelp from './TableLayoutHelp'
import User from '../../models/User'
import AclEntry from '../../models/Acl'
import FieldList from '../../models/FieldList'

export default class TableSettings extends Component {
  static propTypes = {
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string.isRequired,
        title: PropTypes.element.isRequired,
        order: PropTypes.string,
        width: PropTypes.number.isRequired,
      }),
    ).isRequired,
    allFieldNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    tableLayouts: PropTypes.arrayOf(PropTypes.instanceOf(FieldList)),
    selectedTableLayoutId: PropTypes.string,
    user: PropTypes.instanceOf(User),
    layoutActions: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        fn: PropTypes.func.isRequired,
        disabled: PropTypes.bool.isRequired,
        disabledReason: PropTypes.string,
      }),
    ),
    updateFieldsFn: PropTypes.func,
    renameTableLayoutFn: PropTypes.func,
    selectTableLayoutFn: PropTypes.func,
    showModalFn: PropTypes.func,
    hideModalFn: PropTypes.func,
  }

  state = {
    suggestion: undefined,
    suggestions: [],
    renameLayoutId: undefined,
    renameValue: '',
  }

  suggest = (suggestion, lastAction) => {
    const { allFieldNames } = this.props
    const suggestions = []
    if (
      allFieldNames &&
      suggestion &&
      suggestion.length &&
      lastAction === 'type'
    ) {
      const key = suggestion.toLowerCase()
      allFieldNames.forEach(text => {
        if (text.toLowerCase().includes(key)) {
          suggestions.push({ text, score: 0 })
        }
      })
      this.setState({ suggestions, suggestion }) // Do we need to set suggestion always?
    }
  }

  select = text => {
    if (!text) return
    const { fields, updateFieldsFn } = this.props
    const { suggestions } = this.state
    const suggestion = suggestions.find(suggestion => suggestion.text === text)
    const tableFields = fields.map(field => field.field)
    tableFields.push(suggestion.text)
    updateFieldsFn(tableFields)
    this.setState({ suggestions: [], suggestion: '' })
  }

  rename = layout => {
    if (!layout) return
    this.setState({ renameLayoutId: layout.id, renameValue: layout.name })
  }

  changeLayoutName = event => {
    this.setState({ renameValue: event.target.value })
  }

  submitLayoutKey = event => {
    if (event.key === 'Enter') this.renameLayout()
    const isEscape =
      event.keyCode === 27 || event.key === 'Escape' || event.key === 'Esc'
    if (isEscape) this.setState({ renameLayoutId: undefined, renameValue: '' })
  }

  renameLayout = () => {
    const { renameLayoutId, renameValue } = this.state
    if (renameValue && renameValue.length && renameLayoutId) {
      this.props.renameTableLayoutFn(renameLayoutId, renameValue)
    }
    this.setState({ renameLayoutId: undefined, renameValue: '' })
  }

  showHelp = () => {
    const width = '50vw'
    const body = <TableLayoutHelp dismissFp={this.props.hideModalFn} />
    this.props.showModalFn({ body, width })
  }

  render() {
    const {
      tableLayouts,
      selectedTableLayoutId,
      selectTableLayoutFn,
      layoutActions,
      user,
    } = this.props
    const { suggestion, suggestions, renameValue, renameLayoutId } = this.state
    const lockedLayouts = new Set()
    tableLayouts.forEach(layout => {
      if (!layout.hasAccess(user, AclEntry.WriteAccess))
        lockedLayouts.add(layout.id)
    })
    return (
      <div className="TableSettings">
        <div className="TableSettings-add-column">
          <div className="TableSettings-add-column-search">
            <Suggestions
              value={suggestion}
              suggestions={suggestions}
              placeholder="Lookup Column"
              button={
                <div className="TableSettings-add-column-button">
                  Add Column
                </div>
              }
              onChange={this.suggest}
              onSelect={this.select}
            />
          </div>
        </div>
        <div className="TableSettings-layouts">
          <div className="TableSettings-layouts-title">Table Layouts</div>
          <div className="TableSettings-layout-list">
            {tableLayouts && tableLayouts.length ? (
              tableLayouts.map(layout => (
                <div
                  key={layout.id}
                  onClick={_ => selectTableLayoutFn(layout)}
                  className={classnames('TableSettings-layout-item', {
                    selected: layout.id === selectedTableLayoutId,
                    locked: lockedLayouts.has(layout.id),
                  })}>
                  <div className="TableSettings-layout-item-check icon-check" />
                  {layout.id === renameLayoutId ? (
                    <input
                      type="text"
                      autoFocus
                      className="TableSettings-layout-input"
                      value={renameValue}
                      onChange={this.changeLayoutName}
                      onKeyDown={this.submitLayoutKey}
                      onBlur={this.renameLayout}
                    />
                  ) : (
                    <div className="TableSettings-layout-item-label">
                      {layout.name}
                    </div>
                  )}
                  <div
                    className="TableSettings-layout-edit icon-pencil"
                    onClick={_ => this.rename(layout)}
                  />
                  <div className="TableSettings-layout-item-lock icon-lock4" />
                </div>
              ))
            ) : (
              <div
                className={classnames('TableSettings-layout-item', {
                  disabled: true,
                })}>
                <div className="TableSettings-layout-item-check icon-check" />
                <div className="TableSettings-layout-item-label">(None)</div>
              </div>
            )}
          </div>
        </div>
        <div className="TableSettings-actions">
          {layoutActions.map(action => (
            <div
              className={classnames('TableSettings-action', {
                disabled: action.disabled,
              })}
              onClick={!action.disabled && action.fn}
              key={action.label}
              title={action.disabledReason}>
              {action.label} Table layout
            </div>
          ))}
        </div>
        <div className="TableSettings-help" onClick={this.showHelp}>
          <div className="icon-question" />
          <div className="TableSettings-help-item">
            Learn more about working with tables
          </div>
        </div>
      </div>
    )
  }
}
