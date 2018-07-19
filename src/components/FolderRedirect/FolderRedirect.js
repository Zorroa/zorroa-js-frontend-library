import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import AssetSearch from '../../models/AssetSearch'
import { SESSION_STATE_ITEM } from '../../constants/localStorageItems'

export default class FolderRedirect extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        folderId: PropTypes.string.isRequired,
      }),
    }).isRequired,
  }

  getFolderId() {
    return this.props.match.params.folderId
  }

  componentWillMount() {
    const folderId = this.getFolderId()
    const assetSearchQuery = new AssetSearch({
      filter: {
        links: {
          folder: [folderId],
        },
      },
      size: AssetSearch.autoPageSize,
    })
    localStorage.setItem(
      SESSION_STATE_ITEM,
      JSON.stringify({
        search: assetSearchQuery,
      }),
    )
  }

  render() {
    return <Redirect to="/" />
  }
}
