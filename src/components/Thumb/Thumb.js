import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'

import FileIcon from '../FileIcon'
import Duration from '../Duration'
import { DragSource } from '../../services/DragDrop'
import Asset from '../../models/Asset'

import { addSiblings, isolateSelectId } from '../../services/jsUtil'

// Extract thumb page info from an asset
export function page (asset, width, height, protocol, host) {
  const proxy = asset.closestProxy(width, height)
  const url = proxy ? proxy.url(protocol, host) : ''
  const tproxy = asset.tinyProxy()
  const backgroundColor = tproxy ? tproxy[4] : '#888'
  return { url, backgroundColor }
}

// Extract badging info from an asset.
export function badges (asset, protocol, host, stackCount, height) {
  let pageBadge, iconBadge, parentURL

  const pageCount = asset.pageCount()
  const startPage = asset.startPage()
  const stopPage = asset.stopPage()
  if (asset.mediaType().includes('video')) {
    pageBadge = <Duration duration={asset.duration()}/>
  } else if (((stackCount === undefined || stackCount === 0 || stackCount === true) && pageCount) || (stackCount && pageCount && stackCount === pageCount)) {
    pageBadge = <div className="Assets-page-label">{pageCount}</div>
  } else if (stackCount >= 0 && pageCount) {
    pageBadge = <div className="Assets-page-label">{stackCount} of {pageCount}</div>
  } else if (startPage && (!stopPage || startPage === stopPage)) {
    pageBadge = <div className="Assets-page-label">{startPage}</div>
  } else if (startPage && stopPage) {
    pageBadge = <div className="Assets-page-label">{startPage} - {stopPage}</div>
  }

  if (stackCount) {
    iconBadge = <FileIcon ext={asset.value('source.extension')} height={height} />
    parentURL = asset.parentProxyURL(protocol, host)
  }

  return { pageBadge, iconBadge, parentURL }
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
    pageBadge: PropTypes.node,
    iconBadge: PropTypes.element,
    isSelected: PropTypes.bool,
    badgeHeight: PropTypes.number,

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
    const { pageBadge, iconBadge, badgeHeight } = this.props
    if (!pageBadge && !iconBadge) return

    return (
      <div className={classnames('Thumb-badges', {small: badgeHeight < 25 })}>
        {pageBadge ? <div className="Thumb-pages">{pageBadge}</div> : null}
        {iconBadge ? <div className="Thumb-icon">{iconBadge}</div> : null}
      </div>
    )
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
        { pages.slice(0, 3).reverse().map((page, rindex) => {
          const { url, backgroundColor } = page
          const index = Math.min(3, pages.length) - rindex - 1
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
