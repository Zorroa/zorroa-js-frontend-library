import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

import ThumbSizeSlider from './ThumbSizeSlider'
import ThumbLayoutSelector from './ThumbLayoutSelector'
import TableToggle from './TableToggle'
import User from '../../../models/User'

export default class Footer extends PureComponent {
  static propTypes = {
    showTable: PropTypes.bool.isRequired,
    layout: PropTypes.string.isRequired,
    handleLayout: PropTypes.func,
    thumbSize: PropTypes.number.isRequired,
    user: PropTypes.instanceOf(User),
    userSettings: PropTypes.object.isRequired,
    actions: PropTypes.shape({
      setThumbSize: PropTypes.func.isRequired,
      setThumbLayout: PropTypes.func.isRequired,
      showTable: PropTypes.func.isRequired,
      saveUserSettings: PropTypes.func.isRequired,
    }),
  }

  toggleShowTable = () => {
    const { showTable, user, userSettings, actions } = this.props
    actions.showTable(!showTable)
    actions.saveUserSettings(user, { ...userSettings, showTable: !showTable })
  }

  handleLayout() {
    if (typeof this.props.handleLayout === 'function') {
      this.props.handleLayout()
    }
  }

  changeLayout = layout => {
    if (this.props.layout !== layout) {
      this.props.actions.setThumbLayout(layout)
      this.props.actions.saveUserSettings(this.props.user, {
        ...this.props.userSettings,
        thumbLayout: layout,
      })
      this.handleLayout()
    }
  }

  changeThumbSize = thumbSize => {
    if (typeof thumbSize !== 'number') {
      return
    }

    if (this.props.thumbSize !== thumbSize) {
      this.props.actions.setThumbSize(thumbSize)
      this.props.actions.saveUserSettings(this.props.user, {
        ...this.props.userSettings,
        thumbSize,
      })
      this.handleLayout()
    }
  }

  render() {
    return (
      <div className="AssetsFooter">
        <ThumbSizeSlider
          value={this.props.thumbSize}
          onChange={this.changeThumbSize}
        />
        <ThumbLayoutSelector
          thumbLayout={this.props.layout}
          onClick={this.changeLayout}
        />
        <TableToggle
          enabled={this.props.showTable}
          onClick={this.toggleShowTable}
        />
      </div>
    )
  }
}
