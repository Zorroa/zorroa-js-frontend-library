import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import Heading from '../../Heading'
import FlashMessage from '../../FlashMessage'
import { FormButton as Button } from '../../Form'
import SharedTableLayout from '../../../models/SharedTableLayout'
import User from '../../../models/User'
import AclEntry from '../../../models/Acl'
import FieldList from '../../../models/FieldList'

export default class SharedMetadata extends PureComponent {
  static propTypes = {
    isAdministrator: PropTypes.bool.isRequired,
    isFetchingSharedTableLayoutsError: PropTypes.bool.isRequired,
    isSavingSharedTableLayoutsErrorMessage: PropTypes.string.isRequired,
    sharedTableLayouts: PropTypes.arrayOf(
      PropTypes.instanceOf(SharedTableLayout),
    ).isRequired,
    selectedTableLayoutId: PropTypes.string,
    user: PropTypes.instanceOf(User).isRequired,
    tableLayouts: PropTypes.arrayOf(PropTypes.instanceOf(FieldList)),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.shape({
      addTableLayout: PropTypes.func.isRequired,
      fetchTableLayouts: PropTypes.func.isRequired,
      deleteMetadataTableLayout: PropTypes.func.isRequired,
      saveUserSettings: PropTypes.func.isRequired,
      selectTableLayout: PropTypes.func.isRequired,
    }).isRequired,
  }

  componentDidMount() {
    this.props.actions.fetchTableLayouts()
  }

  getTableLayouts() {
    const tableLayouts = this.props.tableLayouts
    if (Array.isArray(tableLayouts) === false) {
      return []
    }

    return [...tableLayouts]
  }

  selectMetadataLayout(event, metadata) {
    event.preventDefault()

    const { user, userSettings } = this.props
    const tableLayouts = this.getTableLayouts()
    const acl = [
      new AclEntry({
        permissionId: user.permissionId,
        access: AclEntry.ReadAccess | AclEntry.WriteAccess,
      }),
    ]
    const id = `${metadata.id}1`
    const name = metadata.getName()
    const fields = [...metadata.getFields()]
    const layout = new FieldList({
      id,
      name,
      acl,
      fields,
    })

    const exisitingLayout = this.getTableLayouts().find(potentialLayout => {
      return layout.isEqual(potentialLayout)
    })
    const hasExisitingMatchingLayout = exisitingLayout !== undefined

    if (hasExisitingMatchingLayout) {
      this.props.actions.selectTableLayout(exisitingLayout.id)
      this.props.actions.saveUserSettings(user, {
        ...userSettings,
        selectedTableLayoutId: exisitingLayout.id,
      })

      return
    }

    tableLayouts.push(layout)
    this.props.actions.addTableLayout(layout)
    this.props.actions.saveUserSettings(user, {
      ...userSettings,
      tableLayouts,
      selectedTableLayoutId: id,
    })
  }

  getTableLayoutById(id) {
    const tableLayouts = this.getTableLayouts()
    return tableLayouts.find(layout => layout.id === id)
  }

  deleteMetadataLayout(event, metadata) {
    event.preventDefault()
    this.props.actions.deleteMetadataTableLayout(
      metadata.getBlobName(),
      metadata.getId(),
    )
  }

  getFieldSummary(layoutFields) {
    const fields = [...layoutFields]
    const lastField = fields.pop()

    if (fields.length === 0 && lastField) {
      return lastField
    }

    if (fields.length === 1) {
      return `${fields[0]} and ${lastField}`
    }

    if (fields.length === 2) {
      return `${fields.join(', ')} and ${lastField}`
    }

    if (fields.length > 2) {
      return `${fields.slice(0, 3).join(', ')} and ${fields.length - 2} more`
    }

    return ''
  }

  isLayoutFieldActive(testFields) {
    const { selectedTableLayoutId } = this.props
    const layout = this.getTableLayoutById(selectedTableLayoutId)

    if (testFields.length === 0) {
      return false
    }

    if (layout === undefined) {
      return false
    }

    if (layout.fields.length !== testFields.length) {
      return false
    }

    return (
      layout.fields.some(exisitingField => {
        return !testFields.includes(exisitingField)
      }) === false
    )
  }

  render() {
    const { sharedTableLayouts, isAdministrator } = this.props
    const layouts = sharedTableLayouts.filter(metadata => !metadata.isEmpty())
    return (
      <div className="SharedMetadata">
        <Heading size="large" level="h2">
          Metadata Templates
        </Heading>
        {this.props.isFetchingSharedTableLayoutsError && (
          <FlashMessage look="error">
            {this.props.isSavingSharedTableLayoutsErrorMessage}
          </FlashMessage>
        )}
        {layouts.length > 0 && (
          <p className="SharedMetadata__help">
            Apply these metadata templates to get a set of fields that are
            highlighted in places like the metadata table.
          </p>
        )}
        {layouts.length === 0 && (
          <p className="SharedMetadata__help">
            It looks like no default metadata tables have been added yet. If you
            have permissions you can use the metadata table dropdown to create
            shared metadata layouts. If you do not have permissions, ask your
            site admin to create new templates.
          </p>
        )}
        <div className="SharedMetadata__list">
          {layouts.map((metadata, index) => {
            const isLayoutActive = this.isLayoutFieldActive(metadata.fields)
            return (
              <div
                className="SharedMetadata__item"
                key={`${metadata.name}-${index}`}>
                <Heading size="small" level="h3">
                  {metadata.getName()}
                  {isLayoutActive && (
                    <span
                      title="This field is currently active"
                      className="icon-check SharedMetadata__headline-icon"
                    />
                  )}
                </Heading>
                <div className="SharedMetadata__field-sumary">
                  Fields: {this.getFieldSummary(metadata.fields)}
                </div>
                <div className="SharedMetadata__item-buttons">
                  <Button
                    disabled={isLayoutActive}
                    title={
                      isLayoutActive
                        ? 'This layout is already active'
                        : 'Update the metadata fields'
                    }
                    className="SharedMetadata__select-layout"
                    type="button"
                    look="mini"
                    onClick={event => {
                      this.selectMetadataLayout(event, metadata)
                    }}>
                    Apply Fields
                  </Button>

                  {isAdministrator && (
                    <Button
                      className="SharedMetadata__delete-layout"
                      type="button"
                      look="minimal"
                      onClick={event => {
                        this.deleteMetadataLayout(event, metadata)
                      }}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
