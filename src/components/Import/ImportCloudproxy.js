import React, { PropTypes } from 'react'

const oses = [ 'linux', 'osx' ]

const index = window.navigator.userAgent.indexOf('Mac') >= 0 ? 1 : (window.navigator.userAgent.indexOf('Linux') >= 0 ? 0 : -1)

const ImportCloudproxy = (props) => (
  <div className="ImportCloudproxy">
    <div className="Import-back" onClick={props.onBack}>
      <div className="icon-chevron-right" style={{transform: 'rotate(180deg)'}}/>
      Back
    </div>
    <div className="Import-title">
      <div className="Import-step">Step 2:</div>
      Download server connection script.
    </div>
    <div className="ImportCloudproxy-downloads">
      {
        props.uploadOverflow && index >= 0 ? (
          <div className="ImportCloudproxy-download" key={oses[index]}>
            <div className="ImportCloudproxy-script icon-script"/>
            <a href={`https://dl.zorroa.com/public/cloudproxy/zorroa-cloudproxy-${oses[index]}.tgz`} download
               className="Import-button"
               onClick={e => props.onSelect(oses[index], e)}>
              Download {oses[index]} Script
            </a>
          </div>
        ) : (
          oses.map(os => (
            <div className="ImportCloudproxy-download" key={os}>
              <div className="ImportCloudproxy-script icon-script"/>
              <a href={`https://dl.zorroa.com/public/cloudproxy/zorroa-cloudproxy-${os}.tgz`} download
                 className="Import-button"
                 onClick={e => props.onSelect(os, e)}>
                Download {os} Script
              </a>
            </div>
          ))
        )
      }
    </div>
    { props.uploadOverflow ? (
    <div className="ImportCloudproxy-upload-overflow">
      <div className="ImportCloudproxy-upload-overflow-highlight">
        That's a lot of stuff! Don't worry, we can handle it.
      </div>
      We'll show you how to run the script next...
    </div>
    ) : (
      <div className="ImportCloudproxy-instructions">
        <div>Run the script on an instance with direct access to your files</div>
        <div>to start a Cloudproxy server to create and upload proxies.</div>
      </div>
    )}
  </div>
)

ImportCloudproxy.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  uploadOverflow: PropTypes.bool.isRequired
}

export default ImportCloudproxy
