import React, { PropTypes } from 'react'
import { articulateQuality, pluralize } from '../utils'

export default function ExportPreviewerVideoClip(props) {
  const { videoAssetCount, exporterArguments } = props

  return (
    <dl className="Exports__review-section">
      <dt className="Exports__review-term">Movie Assets</dt>
      {exporterArguments.exportOriginal === false &&
        videoAssetCount > 0 && (
          <dd className="Exports__review-definition">
            <span>
              {videoAssetCount.toLocaleString()}{' '}
              {pluralize(videoAssetCount, 'asset', 'assets')}
            </span>
            <span>Quality: {articulateQuality(exporterArguments.quality)}</span>
            <span>Resolution: {exporterArguments.scale.replace(':', '×')}</span>
          </dd>
        )}
      {exporterArguments.exportOriginal === true &&
        videoAssetCount > 0 && (
          <dd className="Exports__review-definition">
            <span>
              Export {videoAssetCount.toLocaleString()} original source{' '}
              {pluralize(videoAssetCount, 'file', 'files')}
            </span>
          </dd>
        )}
      {videoAssetCount === 0 && (
        <dd className="Exports__review-definition">None</dd>
      )}
    </dl>
  )
}

ExportPreviewerVideoClip.propTypes = {
  videoAssetCount: PropTypes.number.isRequired,
  exporterArguments: PropTypes.shape({
    format: PropTypes.string.isRequired,
    quality: PropTypes.string.isRequired,
    aspectRatio: PropTypes.string,
    scale: PropTypes.string.isRequired,
  }).isRequired,
}
