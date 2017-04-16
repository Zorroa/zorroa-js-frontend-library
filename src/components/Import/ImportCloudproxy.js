import React, { PropTypes } from 'react'

const oses = [ 'linux', 'osx' ]

const ImportCloudproxy = (props) => (
  <div className="ImportCloudproxy">
    <div className="Import-back" onClick={props.onBack}>
      <div className="icon-chevron-right" style={{transform:'rotate(180deg)'}}/>
      Back
    </div>
    <div className="Import-title">
      <div className="Import-step">Step 2:</div>
      Download server connection script.
    </div>
    <div className="ImportCloudproxy-downloads">
      { oses.map(os => (
        <div className="ImportCloudproxy-download">
          <div className="ImportCloudproxy-script icon-script"/>
          <a  href={`http://dl.zorroa.com/cloudproxy-${os}.tgz`} download
              className="Import-button"
              onClick={e => props.onSelect(os, e)}>
            Download {os} Script
          </a>
        </div>
      ))}
    </div>
    <div className="ImportCloudproxy-instructions">
      <div>Run the script on an instance with direct access to your files</div>
      <div>to start a Cloudproxy server to create and upload proxies.</div>
    </div>
  </div>
)

ImportCloudproxy.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
}

export default ImportCloudproxy
