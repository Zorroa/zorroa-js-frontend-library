import React, { Component } from 'react'
import ContextMenu from '../../ContextMenu'
import PropTypes from 'prop-types'

export default class TableContextMenu extends Component {
  static propTypes = {
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string.isRequired,
        title: PropTypes.element.isRequired,
        order: PropTypes.string,
        width: PropTypes.number.isRequired,
      }),
    ).isRequired,
    contextMenuPos: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    selectedFieldIndex: PropTypes.number.isRequired,
    updateFieldsFn: PropTypes.func.isRequired,
    actions: PropTypes.shape({
      dismissTableContextMenu: PropTypes.func.isRequired,
    }).isRequired,
  }

  moveColumnLeft = () => {
    const { fields, selectedFieldIndex, updateFieldsFn } = this.props
    const { dismissTableContextMenu } = this.props.actions
    const shift = [
      ...fields.slice(0, selectedFieldIndex - 1),
      fields[selectedFieldIndex],
      fields[selectedFieldIndex - 1],
      ...fields.slice(selectedFieldIndex + 1),
    ]
    updateFieldsFn(shift.map(field => field.field))
    dismissTableContextMenu()
  }

  moveColumnRight = () => {
    const { fields, selectedFieldIndex, updateFieldsFn } = this.props
    const { dismissTableContextMenu } = this.props.actions
    const shift = [
      ...fields.slice(0, selectedFieldIndex),
      fields[selectedFieldIndex + 1],
      fields[selectedFieldIndex],
      ...fields.slice(selectedFieldIndex + 2),
    ]
    updateFieldsFn(shift.map(field => field.field))
    dismissTableContextMenu()
  }

  moveColumnToStart = () => {
    const { fields, selectedFieldIndex, updateFieldsFn } = this.props
    const { dismissTableContextMenu } = this.props.actions
    const shift = [
      fields[selectedFieldIndex],
      ...fields.slice(0, selectedFieldIndex),
      ...fields.slice(selectedFieldIndex + 1),
    ]
    updateFieldsFn(shift.map(field => field.field))
    dismissTableContextMenu()
  }

  moveColumnToEnd = () => {
    const { fields, selectedFieldIndex, updateFieldsFn } = this.props
    const { dismissTableContextMenu } = this.props.actions
    const shift = [
      ...fields.slice(0, selectedFieldIndex),
      ...fields.slice(selectedFieldIndex + 1),
      fields[selectedFieldIndex],
    ]
    updateFieldsFn(shift.map(field => field.field))
    dismissTableContextMenu()
  }

  removeColumn = () => {
    const { fields, selectedFieldIndex, updateFieldsFn } = this.props
    const { dismissTableContextMenu } = this.props.actions
    const shift = [...fields]
    shift.splice(selectedFieldIndex, 1)
    updateFieldsFn(shift.map(field => field.field))
    dismissTableContextMenu()
  }

  getMenuItems = () => {
    const { fields } = this.props
    const items = [
      {
        fn: this.moveColumnLeft,
        icon: 'icon-arrow-left',
        label: 'Move column left',
        disabled: index => index === 0,
      },
      {
        fn: this.moveColumnRight,
        icon: 'icon-arrow-right2',
        label: 'Move column right',
        disabled: index => index >= fields.length - 1,
      },
      {
        fn: this.moveColumnToStart,
        icon: 'icon-enter-left2',
        label: 'Move column to start',
        disabled: index => index === 0,
      },
      {
        fn: this.moveColumnToEnd,
        icon: 'icon-enter-right2',
        label: 'Move column to end',
        disabled: index => index >= fields.length - 1,
      },
      {
        fn: this.removeColumn,
        icon: 'icon-delete-column',
        label: 'Remove column',
        disabled: () => false,
      },
      {
        icon: 'icon-table-freeze',
        label: 'Freeze column',
        disabled: () => true,
      },
    ]

    return items
  }

  render() {
    const { contextMenuPos, selectedFieldIndex } = this.props
    const { dismissTableContextMenu } = this.props.actions
    return (
      <ContextMenu
        contextMenuPos={contextMenuPos}
        onDismissFn={dismissTableContextMenu}
        updateFieldsFn={this.updateFields}
        selectedAssetIds={this.selectedAssetIds}
        items={this.getMenuItems()}
        selectedFieldIndex={selectedFieldIndex}
      />
    )
  }
}
