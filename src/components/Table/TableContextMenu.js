import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class TableContextMenu extends Component {
  static propTypes = {
    fields: PropTypes.arrayOf(PropTypes.shape({
      field: PropTypes.string.isRequired,
      title: PropTypes.element.isRequired,
      order: PropTypes.string,
      width: PropTypes.number.isRequired
    })).isRequired,
    contextMenuPos: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }).isRequired,
    selectedFieldIndex: PropTypes.number.isRequired,
    onDismiss: PropTypes.func.isRequired,
    updateFieldsFn: PropTypes.func.isRequired
  }

  moveColumnLeft = () => {
    const { fields, selectedFieldIndex, updateFieldsFn, onDismiss } = this.props
    const shift = [...fields.slice(0, selectedFieldIndex - 1), fields[selectedFieldIndex], fields[selectedFieldIndex - 1], ...fields.slice(selectedFieldIndex + 1)]
    updateFieldsFn(shift.map(field => field.field))
    onDismiss()
  }

  moveColumnRight = () => {
    const { fields, selectedFieldIndex, updateFieldsFn, onDismiss } = this.props
    const shift = [...fields.slice(0, selectedFieldIndex), fields[selectedFieldIndex + 1], fields[selectedFieldIndex], ...fields.slice(selectedFieldIndex + 2)]
    updateFieldsFn(shift.map(field => field.field))
    onDismiss()
  }

  moveColumnToStart = () => {
    const { fields, selectedFieldIndex, updateFieldsFn, onDismiss } = this.props
    const shift = [ fields[selectedFieldIndex], ...fields.slice(0, selectedFieldIndex), ...fields.slice(selectedFieldIndex + 1) ]
    updateFieldsFn(shift.map(field => field.field))
    onDismiss()
  }

  moveColumnToEnd = () => {
    const { fields, selectedFieldIndex, updateFieldsFn, onDismiss } = this.props
    const shift = [ ...fields.slice(0, selectedFieldIndex), ...fields.slice(selectedFieldIndex + 1), fields[selectedFieldIndex] ]
    updateFieldsFn(shift.map(field => field.field))
    onDismiss()
  }

  removeColumn = () => {
    const { fields, selectedFieldIndex, updateFieldsFn, onDismiss } = this.props
    const shift = [ ...fields ]
    shift.splice(selectedFieldIndex, 1)
    updateFieldsFn(shift.map(field => field.field))
    onDismiss()
  }

  freezeColumn = () => {
    console.log('Freeze')
  }

  // Keep the context menu from running off the bottom of the screen
  constrainContextMenu = (ctxMenu) => {
    if (!ctxMenu) return
    const { contextMenuPos } = this.props
    if (contextMenuPos.y + ctxMenu.clientHeight > window.innerHeight) {
      this.setState({ contextMenuPos: { ...contextMenuPos, y: window.innerHeight - ctxMenu.clientHeight } })
    }
  }

  render () {
    const { fields } = this.props
    const { contextMenuPos, selectedFieldIndex, onDismiss } = this.props
    const items = [
       { fn: this.moveColumnLeft, icon: 'icon-arrow-left', label: 'Move column left', disabled: (index) => (index === 0) },
       { fn: this.moveColumnRight, icon: 'icon-arrow-right2', label: 'Move column right', disabled: (index) => (index >= fields.length - 1) },
       { fn: this.moveColumnToStart, icon: 'icon-enter-left2', label: 'Move column to start', disabled: (index) => (index === 0) },
       { fn: this.moveColumnToEnd, icon: 'icon-enter-right2', label: 'Move to end', disabled: (index) => (index >= fields.length - 1) },
       { fn: this.removeColumn, icon: 'icon-delete-column', label: 'Remove column', disabled: (index) => (false) },
       { fn: this.freezeColumn, icon: 'icon-table-freeze', label: 'Freeze column', disabled: (index) => (true) }
    ]
    return (
      <div>
        <div onClick={onDismiss} className="Table-context-background" onContextMenu={onDismiss} />
        <div className="Table-context-menu" ref={ this.constrainContextMenu }
             onClick={onDismiss} onContextMenu={onDismiss}
             style={{ top: contextMenuPos.y, left: contextMenuPos.x }}>
             { items.map(item => (
               <div className={classnames('Table-context-item', {disabled: item.disabled(selectedFieldIndex)})} onClick={!item.disabled(selectedFieldIndex) && (e => item.fn(item, e))} key={item.label}>
                 <div className={`Table-context-icon ${item.icon}`}/>
                 <div className="Table-context-label">{item.label}</div>
               </div>
             ))}
        </div>
      </div>
    )
  }
}
