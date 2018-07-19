import PropTypes from 'prop-types'
import React from 'react'

const oses = ['linux', 'osx']

const ImportCloudproxy = props => (
  <div className="ImportCloudproxy">
    <div className="Import-back" onClick={props.onBack}>
      <div className="icon-arrow-down" style={{ transform: 'rotate(90deg)' }} />
      Back
    </div>
    <div className="Import-title">
      <div className="Import-step">Step 2:</div>
      Download upload server.
    </div>
    <div className="ImportCloudproxy-downloads">
      {oses.map(os => (
        <div className="ImportCloudproxy-download" key={os}>
          <div className="ImportCloudproxy-script icon-script" />
          <a
            href={`https://dl.zorroa.com/public/cloudproxy/zorroa-cloudproxy-${os}.tgz`}
            download
            className="Import-button"
            onClick={e => props.onSelect(os, e)}>
            Download {os} Script
          </a>
        </div>
      ))}
    </div>
    <div className="ImportCloudproxy-instructions">
      <div>Run the server on an computer with direct access to your files</div>
      <div>to start a Cloudproxy server to create and upload proxies.</div>
    </div>
  </div>
)

ImportCloudproxy.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
}

export default ImportCloudproxy
