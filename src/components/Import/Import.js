import React, { PropTypes } from 'react'

import CloudBackground from './CloudBackground.svg'
import CloudServices from './CloudServices.svg'
import ServerBackground from './ServerBackground.svg'
import LocalBackground from './LocalBackground.svg'

export const CLOUD_IMPORT = 'CLOUD_IMPORT'
export const SERVER_IMPORT = 'SERVER_IMPORT'
export const LOCAL_IMPORT = 'LOCAL_IMPORT'

const Import = (props) => (
  <div className="Import">
    <div className="Import-intro">
      { props.userFirstName && props.userFirstName.length && (
        <div className="Import-first-time">
          <div>Hello there, {props.userFirstName}!</div>
          <div>Welcome to Zorroa. The first step is to index your assets.
            These can be any files you have &mdash; images, videos, PDFs, and more.</div>
        </div>
      )}
      <div>Your assets will stay exactly where they are. Zorroa will take a small
        snapshot (we call them proxies) of your data and index it in our system.</div>
    </div>
    <div className="Import-title">Where is your stuff?</div>
    <div className="Import-locations">
      <div className="Import-location">
        <div className="flexColCenter">
          <img src={CloudBackground}/>
          <img src={CloudServices}/>
        </div>
        <div className="Import-location-overlay">
          <div className="Import-location-button" onClick={e => props.onSelect(CLOUD_IMPORT, e)}>
            On a cloud service
          </div>
        </div>
      </div>
      <div className="Import-location">
        <img src={ServerBackground}/>
        <div className="Import-location-overlay">
          <div className="Import-location-button" onClick={e => props.onSelect(SERVER_IMPORT, e)}>
            On a file server
          </div>
        </div>
      </div>
      <div className="Import-location">
        <img src={LocalBackground}/>
        <div className="Import-location-overlay">
          <div className="Import-location-button" onClick={e => props.onSelect(LOCAL_IMPORT, e)}>
            On my computer
          </div>
        </div>
      </div>
    </div>
  </div>
)

Import.propTypes = {
  userFirstName: PropTypes.string,
  onSelect: PropTypes.func.isRequired
}

export default Import
