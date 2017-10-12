import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classnames from 'classnames'

import Duration from '../Duration'
import { DragSource } from '../../services/DragDrop'
import Asset from '../../models/Asset'

import { addSiblings, isolateSelectId, replaceVariables, valuesForFields, parseVariables, PubSub } from '../../services/jsUtil'
import Video from '../Video'
import FieldTemplate from '../FieldTemplate'

// Extract thumb page info from an asset
export function page (asset, width, height, origin) {
  const url = asset && asset.closestProxyURL(origin, width, height) || ''
  const tproxy = asset && asset.tinyProxy()
  const backgroundColor = tproxy ? tproxy[4] : '#888'
  return { url, backgroundColor }
}

// Called when dragging an asset to assign assetIds to drop info
const source = {
  dragStart (props, type, se) {
    const { assetId, selectedAssetIds, allAssets, showMultipage, dragFieldTemplate } = props
    let assetIds = isolateSelectId(assetId, selectedAssetIds)
    if (showMultipage) {
      assetIds = new Set(assetIds)      // Don't change app state
      addSiblings(assetIds, allAssets)  // Modifies assetIds
    }

    // gather "external" asset ids, for drag and drop assets over to external apps,
    // created by evaluating the asset fields template.
    let assets = []
    assetIds.forEach(id => {
      const index = allAssets.findIndex(asset => (asset.id === id))
      if (index >= 0) assets.push(allAssets[index])
    })
    const vars = parseVariables(dragFieldTemplate)
    let assetExtIds = []
    assets.forEach(asset => {
      const values = valuesForFields(vars, asset)
      const assetExtId = replaceVariables(dragFieldTemplate, values)
      assetExtIds.push(assetExtId)
    })

    return {assetIds, assetExtIds}
  }
}

// Internal component to render an image div with children (badges)
const ImageThumb = (props) => {
  const { url, backgroundColor, children } = props
  const style = {
    backgroundColor,
    'backgroundSize': 'contain',
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
    dim: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      x: PropTypes.number,
      y: PropTypes.number
    }).isRequired,
    pages: PropTypes.arrayOf(PropTypes.shape({
      url: React.PropTypes.string,
      backgroundColor: React.PropTypes.string
    })).isRequired,

    // Rendering options
    iconBadge: PropTypes.element,
    isSelected: PropTypes.bool,
    badgeHeight: PropTypes.number,
    asset: PropTypes.instanceOf(Asset).isRequired,
    showMultipageBadges: PropTypes.bool,

    // Actions
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,

    // Dragging properties
    assetId: PropTypes.string,
    dragparams: PropTypes.object,

    // properties from app state
    allAssets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    origin: PropTypes.string,
    parentTotals: PropTypes.instanceOf(Map),
    showMultipage: PropTypes.bool,
    selectedAssetIds: PropTypes.instanceOf(Set),
    thumbFieldTemplate: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      videoStarted: false,
      videoPlaying: false,
      doVideoPreview: false,
      showBadge: false
    }

    this.shuttler = new PubSub()
    this.status = new PubSub()

    this.status.on('started', videoStarted => {
      if (this.state.videoStarted && !videoStarted) this.setState({ doVideoPreview: false })
      this.setState({ videoStarted })
    })
    this.status.on('playing', videoPlaying => { this.setState({ videoPlaying }) })
  }

  // Extract badging info from an asset.
  renderMonopageBadges = (asset) => {
    const startPage = asset.startPage()
    const stopPage = asset.stopPage()
    let pageBadge
    if (asset.mediaType().includes('video')) {
      pageBadge = (
        <Duration duration={asset.duration()}
                  onClick={_ => {
                    this.setState({ doVideoPreview: true },
                      _ => this.shuttler.publish('startOrStop'))
                  }}
                  playing={this.state.videoStarted}/>
      )
    } else if (startPage && (!stopPage || startPage === stopPage)) {
      pageBadge = <div className="Thumb-page-label">{startPage}</div>
    } else if (startPage && stopPage) {
      pageBadge = <div className="Thumb-page-label">{startPage} - {stopPage}</div>
    }
    return { pageBadge }
  }

  renderMultipageBadges = (asset, origin, stackCount) => {
    let pageBadge, parentURL

    const pageCount = asset.pageCount() || stackCount
    const startPage = asset.startPage()
    const stopPage = asset.stopPage()
    if (pageCount > 1) {
      if (stackCount > 0 && stackCount !== pageCount) {
        pageBadge = <div className="Thumb-page-label">{stackCount} of {pageCount}</div>
      } else if (stackCount === pageCount) {
        pageBadge = <div className="Thumb-page-label">{pageCount}</div>
      } else if (startPage && (!stopPage || startPage === stopPage)) {
        pageBadge = <div className="Thumb-page-label">{startPage}</div>
      } else if (startPage && stopPage) {
        pageBadge = <div className="Thumb-page-label">{startPage} - {stopPage}</div>
      }
    } else if (asset.mediaType().includes('video')) {
      pageBadge = <Duration duration={asset.duration()}/>
    }

    // Show the icon & inset if we have any page badging
    if (pageBadge) {
      parentURL = asset.smallestParentProxyURL(origin)
    }

    return { pageBadge, parentURL }
  }

  renderBadges = (asset, origin, stackCount) => {
    const { badgeHeight, showMultipageBadges, thumbFieldTemplate } = this.props
    const { showBadge } = this.state
    const iconBadge = showBadge ? <div className="Thumb-field"><FieldTemplate asset={asset} template={thumbFieldTemplate} extensionOnLeft={false}/></div> : null
    const { pageBadge, parentURL } = showMultipageBadges
      ? this.renderMultipageBadges(asset, origin, stackCount)
      : this.renderMonopageBadges(asset)

    if (!pageBadge && !iconBadge) return { }

    return { parentURL,
      badges: (
        <div className={classnames('Thumb-badges', { small: badgeHeight < 25 })}>
          {pageBadge ? <div className="Thumb-pages">{pageBadge}</div> : null}
          {iconBadge ? <div className="Thumb-icon">{iconBadge}</div> : null}
        </div>
      )
    }
  }

  renderOverlays = () => {
    return (
      <div className='Thumb-selection'>
        <div className='Thumb-selection-check icon-check'/>
      </div>
    )
  }

  vidError = (error) => {
    console.log(error)
  }

  onMouseEnter = (event) => {
    this.setState({ showBadge: true })
  }

  onMouseLeave = (event) => {
    this.setState({ showBadge: false })
  }

  render () {
    const {pages, isSelected, onClick, onDoubleClick, dragparams, parentTotals} = this.props
    const {width, height, x, y} = this.props.dim      // Original thumb rect
    if (!width || !height) return null

    const style = {width, height, left: x, top: y}    // Dim -> left, right
    const { asset, origin } = this.props

    const parentId = asset.parentId()
    const stackCount = parentId && parentTotals && parentTotals.get(parentId)

    const { parentURL, badges } = this.renderBadges(asset, origin, stackCount)

    if (!parentURL) {
      const { url, backgroundColor } = pages[0]
      const shouldRenderVideo = this.state.doVideoPreview && asset.mediaType().includes('video')
      const shouldRenderImageThumb = !this.state.videoPlaying
      const loading = require('../Inspector/loading-ring.svg')

      return (
        <div className={classnames('Thumb', {isSelected})}
             style={style}
             onClick={onClick}
             onDoubleClick={onDoubleClick}
             onMouseEnter={this.onMouseEnter}
             onMouseLeave={this.onMouseLeave}
             {...dragparams}>
          { shouldRenderVideo && (
            <Video shuttler={this.shuttler}
                   status={this.status}
                   url={asset.url(origin)}
                   backgroundURL={asset.backgroundURL(origin)}
                   frames={asset.frames()}
                   frameRate={asset.frameRate()}
                   startFrame={asset.startFrame()}
                   stopFrame={asset.stopFrame()}
                   onError={this.vidError}>
              { shouldRenderImageThumb ? (
                <div className='Thumb-video-waiting flexCenter fullWidth fullHeight' style={{ position: 'absolute', top: '0', left: 0 }}>
                  <ImageThumb url={url} backgroundColor={backgroundColor}/>
                  <img className='Thumb-video-waiting-spinner' src={loading} style={{ position: 'relative' }}/>
                </div>
                )
                : null }
              { this.renderOverlays() }
              { badges }
            </Video>
          ) || (
            <ImageThumb url={url} backgroundColor={backgroundColor}>
              { this.renderOverlays() }
              { badges }
            </ImageThumb>)
          }
        </div>
      )
    }

    return (
      <div className={classnames('Thumb', {isSelected})}
           style={style}
           onClick={onClick}
           onDoubleClick={onDoubleClick}
           onMouseEnter={this.onMouseEnter}
           onMouseLeave={this.onMouseLeave}
           {...dragparams}>
        { pages.slice(0, 3).reverse().map((page, rindex) => {
          const { url, backgroundColor } = page
          const index = Math.min(3, pages.length) - rindex - 1
          return (
            <div key={`${url}-${index}`}
                 className={classnames('Thumb-stack', `Thumb-stack-${index}`)}>
              <ImageThumb url={url} backgroundColor={backgroundColor}/>
              { rindex === pages.length - 1 && badges }
            </div>
          )
        })}
        <div className="Thumb-inset">
          <ImageThumb url={parentURL}/>
        </div>
        { this.renderOverlays() }
      </div>
    )
  }
}

export default connect(state => ({
  allAssets: state.assets.all,
  dragFieldTemplate: state.app.dragFieldTemplate,
  origin: state.auth.origin,
  parentTotals: state.assets.parentTotals,
  selectedAssetIds: state.assets.selectedIds,
  showMultipage: state.app.showMultipage,
  thumbFieldTemplate: state.app.thumbFieldTemplate
}))(Thumb)
