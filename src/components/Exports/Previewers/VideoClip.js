import React, {PropTypes} from 'react'
import { articulateQuality } from '../utils'

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
          {movieAssetCount} assets
        </span>
        <span>
          Export as: {exporterArguments.format.toUpperCase()}
        </span>
        <span>
          Quality: {articulateQuality(exporterArguments.quality)}
        </span>
        <span>
          Aspect Ratio: {exporterArguments.aspectRatio || 'Original'}
        </span>
        <span>
          Resolution: {exporterArguments.resolution}p
        </span>
      </dd>)}
      {exporterArguments.exportOriginal === true && movieAssetCount > 0 && (
        <dd className="Exports__review-definition">
          <span>
            Export {movieAssetCount} original source files
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
