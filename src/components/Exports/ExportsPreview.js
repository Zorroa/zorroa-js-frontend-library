import React, {PropTypes} from 'react'
import Asset from '../../models/Asset'
import Masonry from 'react-masonry-component'

const masonryOptions = {
  transitionDuration: 0
}

export default function ExportsPreview (props) {
  return (
    <div className="Exports__asset-preview-wrapper">
      <Masonry
        className={'Exports__asset-preview'}
        elementType={'ul'}
        options={masonryOptions}
      >
        {[...props.selectedAssets].slice(0, 12).map((asset, index) => {
          const proxy = asset.closestProxy()
          const url = asset.closestProxyURL(props.origin, 300, 300)

          if (!proxy) {
            return null
          }

          return (
            <li key={`${url}-${index}`} className="Exports__asset-preview-item">
              <img
                height={proxy.height}
                width={proxy.width}
                src={url}
                className="Exports__asset-preview-proxy"
              />
            </li>
          )
        })}
      </Masonry>
    </div>
  )
}

ExportsPreview.propTypes = {
  selectedAssets: PropTypes.arrayOf(
    PropTypes.instanceOf(Asset)
  ),
  origin: PropTypes.string.isRequired
}
