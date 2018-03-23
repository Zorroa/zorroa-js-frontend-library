import React, {PropTypes} from 'react'
import {
  articulateQuality,
  pluralize
} from '../utils'

export default function ExportPreviewerVideoClip (props) {
  const {
    movieAssetCount,
    exporterArguments
  } = props

  return (
    <dl className="Exports__review-section">
      <dt className="Exports__review-term">Movie Assets</dt>
      {exporterArguments.exportOriginal === false && movieAssetCount > 0 && (<dd className="Exports__review-definition">
        <span>
          {movieAssetCount.toLocaleString()} {pluralize(movieAssetCount, 'asset', 'assets')}
        </span>
        <span>
          Quality: {articulateQuality(exporterArguments.quality)}
        </span>
        <span>
          Resolution: {exporterArguments.resolution.replace(':', '×')}
        </span>
      </dd>)}
      {exporterArguments.exportOriginal === true && movieAssetCount > 0 && (
        <dd className="Exports__review-definition">
          <span>
            Export {movieAssetCount.toLocaleString()} original source {pluralize(movieAssetCount, 'file', 'files')}
          </span>
        </dd>
      )}
      {movieAssetCount === 0 && (<dd className="Exports__review-definition">
        None
      </dd>)}
    </dl>
  )
}

ExportPreviewerVideoClip.propTypes = {
  movieAssetCount: PropTypes.number.isRequired,
  exporterArguments: PropTypes.shape({
    format: PropTypes.string.isRequired,
    quality: PropTypes.number.isRequired,
    aspectRatio: PropTypes.string,
    resolution: PropTypes.number.isRequired
  }).isRequired
}
