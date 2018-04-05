import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'
import './PreferencesPane.scss'

export default class PreferencesPaneMenuItem extends Component {
  static propTypes = {
    paneName: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    activePaneName: PropTypes.string,
    children: PropTypes.node,
  }

  setActivePane = () => {
    this.props.onClick(this.props.paneName)
  }

  isPaneActive(pane) {
    return pane === this.props.activePaneName
  }

  render() {
    const classes = classnames('PreferencesPane__menu-item', {
      'PreferencesPane__menu-item--active': this.isPaneActive(
        this.props.paneName,
      ),
    })

    return (
      <li className={classes}>
        <a
          onClick={() => {
            this.setActivePane()
          }}
          className="PreferencesPane__menu-link">
          {this.props.children}
        </a>
      </li>
    )
  }
}
