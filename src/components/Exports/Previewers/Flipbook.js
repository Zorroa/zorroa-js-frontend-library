import React, {PropTypes} from 'react'
import { articulateQuality, pluralize } from '../utils'

export default function ExportPreviewerFlipbook (props) {
  const {
    flipbookAssetCount,
    exporterArguments
  } = props

  return (
    <dl className="Exports__review-section">
      <dt className="Exports__review-term">Flipbook Assets</dt>
      {flipbookAssetCount > 0 && (
        <dd className="Exports__review-definition">
          <span>
            {flipbookAssetCount.toLocaleString()} {pluralize(flipbookAssetCount, 'asset', 'assets')}
          </span>
          <span>
            Export as: {(({exportImages, exportMovies}) => {
              if (exportImages && exportMovies) {
                return 'Movie and Image Files'
              }

              if (exportMovies) {
                return 'Movie Files'
              }

              if (exportImages) {
                return 'Image Files'
              }
            })(exporterArguments)}
          </span>
          <span>
            Quality: {articulateQuality(exporterArguments.quality)}
          </span>
          <span>
            Frame Rate: {exporterArguments.frameRate}
          </span>
        </dd>
      )}
      {flipbookAssetCount === 0 && (
        <dd className="Exports__review-definition">
          None
        </dd>
      )}
    </dl>
  )
}

ExportPreviewerFlipbook.propTypes = {
  flipbookAssetCount: PropTypes.number.isRequired,
  exporterArguments: PropTypes.shape({
    quality: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    exportImages: PropTypes.bool.isRequired,
    exportMovies: PropTypes.bool.isRequired
  }).isRequired
}
