import React, { PropTypes } from 'react'
import arrow from './Curved_Arrow.svg'

const FirstImportTip = (props) => (
  <div className="FirstImportTip">
    <img className="FirstImportTip-arrow" src={arrow}/>
    <div className="FirstImportTip-title">Let's get started!</div>
    <div className="FirstImportTip-body">
      <div className="FirstImportTip-text">Create a new Import to load assets into Zorroa.</div>
      <div className="FirstImportTip-text">You can import from Dropbox, Google Drive, Box or from a local folder.</div>
      <div className="FirstImportTip-text">Your assets are never moved -- simply indexed and analyzed in-place.</div>
    </div>
    <div onClick={props.onCreateImport} className="FirstImportTip-button">Create Import</div>
  </div>
)

FirstImportTip.propTypes = {
  onCreateImport: PropTypes.func.isRequired
}

export default FirstImportTip
