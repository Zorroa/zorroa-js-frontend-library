import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { DragSource } from '../../services/DragDrop'
import Asset from '../../models/Asset'
import classnames from 'classnames'

import {
  addSiblings,
  formatDuration,
  parseFormattedFloat,
  isolateSelectId } from '../../services/jsUtil'

// Extract thumb page info from an asset
export function page (asset, width, height, protocol, host) {
  const proxy = asset.closestProxy(width, height)
  const url = proxy ? proxy.url(protocol, host) : ''
  const tproxy = asset.tinyProxy()
  const backgroundColor = tproxy ? tproxy[4] : '#888'
  return { url, backgroundColor }
}

// Extract badging info from an asset.
export function badges (asset, protocol, host) {
  const mediaType = asset.mediaType().toLowerCase()
  let pageBadge, duration, iconBadge

  if (mediaType.startsWith('image') && asset.value('image.subimages')) {
    pageBadge = asset.value('image.subimages')
  } else if (mediaType.includes('video') || mediaType.includes('sequence')) {
    duration = asset.duration()
  } else if (mediaType === 'application/pdf' || asset.value('document.pages')) {
    iconBadge = require('./pdf-icon.png')
    pageBadge = asset.value('document.pages')
  }

  const parentURL = asset.parentProxyURL(protocol, host)
  return { pageBadge, iconBadge, duration, parentURL }
}

// Called when dragging an asset to assign assetIds to drop info
const source = {
  dragStart (props, type, se) {
    const { assetId, selectedAssetIds, allAssets, showMultipage } = props
    let assetIds = isolateSelectId(assetId, selectedAssetIds)
    if (showMultipage) {
      assetIds = new Set(assetIds)      // Don't change app state
      addSiblings(assetIds, allAssets)  // Modifies assetIds
    }
    return {assetIds}
  }
}

// Internal component to render an image div with children (badges)
const ImageThumb = (props) => {
  const { url, backgroundColor, children } = props
  const style = {
    backgroundColor,
    'backgroundSize': 'cover',
    'backgroundImage': `url(${url})`
  }
  return (
    <div className={classnames('ImageThumb')} style={style}>
      { children }
    </div>
  )
}

ImageThumb.propTypes = {
  url: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string,
  children: PropTypes.arrayOf(React.PropTypes.element)
}

@DragSource('ASSET', source)
class Thumb extends Component {
  static propTypes = {
    // Rendering properties
    dim: PropTypes.object.isRequired,
    pages: PropTypes.arrayOf(PropTypes.shape({
      url: React.PropTypes.string,
      backgroundColor: React.PropTypes.string
    })).isRequired,

    // Rendering options
    parentURL: PropTypes.string,
    pageBadge: PropTypes.string,
    iconBadge: PropTypes.element,
    duration: PropTypes.number,
    isSelected: PropTypes.bool,

    // Actions
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,

    // Dragging properties
    assetId: PropTypes.string,
    dragparams: PropTypes.object,

    // Dragging properties from app state
    allAssets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    showMultipage: PropTypes.bool,
    selectedAssetIds: PropTypes.instanceOf(Set)
  }

  renderBadges = () => {
    const { pageBadge, duration, iconBadge } = this.props
    const { width, height } = this.props.dim

    const hideText = (!pageBadge && !duration) || width < 50 || height < 50
    const textStyle = hideText ? { display: 'none' } : {}
    const small = width < 80 || height < 80

    if (pageBadge || iconBadge) {
      return (
        <div className="Thumb-multipage-badge">
          <div className={classnames('icon', {small})}><img src={iconBadge}/></div>
          <div style={textStyle} className={classnames('Thumb-pages', {small})}>
            {pageBadge}
          </div>
        </div>
      )
    } else if (duration) {
      return (
        <div className="Thumb-time-badge">
          <div className={classnames('Thumb-play-badge', {small})}>
            <div className={classnames('Thumb-arrow-right', {small})} />
          </div>
          <div style={textStyle} className={classnames('Thumb-duration', {small})}>
            { formatDuration(parseFormattedFloat(duration)) }
          </div>
        </div>
      )
    }
  }

  renderOverlays = () => {
    return (
      <div className='Thumb-selection'>
        <div className='Thumb-selection-overlay'/>
        <div className='Thumb-selection-check icon-check'/>
      </div>
    )
  }

  render () {
    const {pages, parentURL, isSelected, onClick, onDoubleClick, dragparams} = this.props
    const {width, height, x, y} = this.props.dim      // Original thumb rect
    if (!width || !height) return null

    const style = {width, height, left: x, top: y}    // Dim -> left, right

    if (!parentURL) {
      const { url, backgroundColor } = pages[0]
      return (
        <div className={classnames('Thumb', {isSelected})} style={style}
             onClick={onClick} onDoubleClick={onDoubleClick} {...dragparams}>
          <ImageThumb url={url} backgroundColor={backgroundColor}>
            { this.renderOverlays() }
            { this.renderBadges() }
          </ImageThumb>
        </div>
      )
    }

    return (
      <div className={classnames('Thumb', {isSelected})} style={style}
           onClick={onClick} onDoubleClick={onDoubleClick} {...dragparams}>
        { pages.slice(0).reverse().map((page, rindex) => {
          const { url, backgroundColor } = page
          const index = pages.length - rindex - 1
          return (
            <div key={`${url}-${index}`}
                 className={classnames('Thumb-stack', `Thumb-stack-${index}`)}>
              <ImageThumb url={url} backgroundColor={backgroundColor}/>
            </div>
          )
        })}
        <div className="Thumb-inset">
          <ImageThumb url={parentURL}/>
        </div>
        { this.renderOverlays() }
        { this.renderBadges() }
      </div>
    )
  }
}

export default connect(state => ({
  showMultipage: state.app.showMultipage,
  allAssets: state.assets.all,
  selectedAssetIds: state.assets.selectedIds
}))(Thumb)
