import React, { PropTypes } from 'react'
import { articulateQuality, pluralize } from '../utils'

export default function ExportPreviewerPdf(props) {
  const { documentAssetCount, exporterArguments } = props

  return (
    <dl className="Exports__review-section">
      <dt className="Exports__review-term">Document Assets</dt>
      {exporterArguments.exportOriginal === false &&
        documentAssetCount > 0 && (
          <dd className="Exports__review-definition">
            <span>
              {documentAssetCount.toLocaleString()}{' '}
              {pluralize(documentAssetCount, 'asset', 'assets')}
            </span>
            <span>
              Export as:{' '}
              {(({ pageMode, mediaType }) => {
                const formattedMediaType = mediaType.toUpperCase()

                if (pageMode === 'merge') {
                  return `Combined ${formattedMediaType}`
                }

                return `Single page ${formattedMediaType}`
              })(exporterArguments)}
            </span>
            <span>Quality: {articulateQuality(exporterArguments.quality)}</span>
            <span>Size: {exporterArguments.size}px</span>
          </dd>
        )}
      {exporterArguments.exportOriginal === true &&
        documentAssetCount > 0 && (
          <dd className="Exports__review-definition">
            <span>
              Export {documentAssetCount.toLocaleString()} original source{' '}
              {pluralize(documentAssetCount, 'file', 'files')}
            </span>
          </dd>
        )}
      {documentAssetCount === 0 && (
        <dd className="Exports__review-definition">None</dd>
      )}
    </dl>
  )
}

ExportPreviewerPdf.propTypes = {
  documentAssetCount: PropTypes.number.isRequired,
  exporterArguments: PropTypes.shape({
    quality: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    mediaType: PropTypes.string.isRequired,
    pageMode: PropTypes.oneOf(['merge', 'separate']),
  }).isRequired,
}
