import React, { Component } from 'react'
import PropTypes from 'prop-types'
import downloadjs from 'downloadjs'

import ContextMenu from '../../ContextMenu'
import Asset from '../../../models/Asset'
import getImage from '../../../services/getImage'

export default class AssetContextMenu extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    contextMenuPos: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    onDismiss: PropTypes.func.isRequired,
    selectedIds: PropTypes.instanceOf(Set),
    origin: PropTypes.string,

    // connect actions
    actions: PropTypes.shape({
      isolateAssetId: PropTypes.func.isRequired,
    }).isRequired,

    // router props
    history: PropTypes.object,
  }

  getMenuItems = () => {
    const items = [
      {
        fn: this.downloadAsset,
        icon: 'icon-download5',
        label: 'Download',
        disabled: () => false,
      },
      {
        fn: this.openInLightbox,
        icon: 'icon-open_in_browser',
        label: 'Open in Lightbox',
        disabled: () => false,
      },
      // features not ready
      // {
      //   fn: this.editHold,
      //   icon: '',
      //   label: 'Edit Hold',
      //   disabled: () => false,
      // },
      // {
      //   fn: this.editClassification,
      //   icon: '',
      //   label: 'Edit Classification',
      //   disabled: () => false,
      // },
      // {
      //   fn: this.deleteAsset,
      //   icon: 'icon-cross',
      //   label: 'Delete Asset',
      //   disabled: () => false,
      // },
    ]

    return items
  }

  getAssets = () => {
    let { assets, selectedIds } = this.props
    const idsArray = [...selectedIds]
    return idsArray.map(id => {
      return assets.find(asset => asset.id === id)
    })
  }

  getAssetURL(asset) {
    const { origin } = this.props
    if (!asset) {
      return null
    }
    return asset.url(origin)
  }

  downloadAsset = () => {
    const downloadAssets = this.getAssets()
    downloadAssets.forEach(asset => {
      const { source } = asset.document
      const { filename, mediaType } = source
      const options = { format: 'blob' }
      const url = this.getAssetURL(asset)
      this.fetch(url, options, filename, mediaType)
    })
  }

  fetch(url, options, filename, mediaType) {
    getImage(url, options).then(image => {
      downloadjs(image, filename, mediaType)
    })
  }

  openInLightbox = () => {
    const { history } = this.props
    const idArray = [...this.props.selectedIds]
    this.props.actions.isolateAssetId(idArray[0], history)
  }

  editHold = () => {
    console.log('editHold:', this.props.selectedIds)
  }

  editClassification = () => {
    console.log('editClassification:', this.props.selectedIds)
  }

  deleteAsset = () => {
    console.log('deleteAsset:', this.props.selectedIds)
  }

  render() {
    const { contextMenuPos, onDismiss } = this.props

    return (
      <ContextMenu
        contextMenuPos={contextMenuPos}
        onDismissFn={onDismiss}
        items={this.getMenuItems()}
      />
    )
  }
}
