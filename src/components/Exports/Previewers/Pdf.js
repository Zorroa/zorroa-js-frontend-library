import PropTypes from 'prop-types'
import React from 'react'
import { pluralize } from '../utils'

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
              {(({ pageMode }) => {
                if (pageMode === 'merge') {
                  return `Combined PDF`
                }

                return `Single page PDF`
              })(exporterArguments)}
            </span>
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
    pageMode: PropTypes.oneOf(['merge', 'separate']),
  }).isRequired,
}
