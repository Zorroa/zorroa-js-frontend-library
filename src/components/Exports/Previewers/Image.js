import React, {PropTypes} from 'react'
import { articulateQuality } from '../utils'

export default function ExportPreviewerImage (props) {
  const {
    imageAssetCount,
    exporterArguments
  } = props

  return (
    <dl className="Exports__review-section">
      <dt className="Exports__review-term">Image Assets</dt>
      {exporterArguments.exportOriginal === false && imageAssetCount > 0 && (
        <dd className="Exports__review-definition">
          <span>
            {imageAssetCount} assets
          </span>
          <span>
            Export as: {exporterArguments.format.toUpperCase()}
          </span>
          <span>
            Quality: {articulateQuality(exporterArguments.quality)}
          </span>
          <span>
            Resize: {exporterArguments.size}px
          </span>
        </dd>
      )}
      {exporterArguments.exportOriginal === true && imageAssetCount > 0 && (
        <dd className="Exports__review-definition">
          <span>
            Export {imageAssetCount} original source files
          </span>
        </dd>
      )}
      {imageAssetCount === 0 && (
        <dd className="Exports__review-definition">
          None
        </dd>
      )}
    </dl>
  )
}

ExportPreviewerImage.propTypes = {
  imageAssetCount: PropTypes.number.isRequired,
  exporterArguments: PropTypes.shape({
    quality: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    exportOriginal: PropTypes.bool.isRequired,
    format: PropTypes.string.isRequired
  }).isRequired
}
