import React, { PropTypes } from 'react'

import {
  CLOUD_IMPORT, SERVER_IMPORT, CLOUDPROXY_IMPORT, SERVER_PATH_IMPORT,
  DROPBOX_CLOUD, BOX_CLOUD, GDRIVE_CLOUD
} from './ImportConstants'

import CloudBackground from './CloudBackground.svg'
import ServerBackground from './ServerBackground.svg'
import LocalBackground from './LocalBackground.svg'
import DropboxLogo from './DropboxLogo.svg'
import GDriveLogo from './GDriveLogo.svg'
import BoxLogo from './BoxLogo.svg'

const services = [ DROPBOX_CLOUD, GDRIVE_CLOUD, BOX_CLOUD ]
const serviceIcons = [ DropboxLogo, GDriveLogo, BoxLogo ]
const sources = [ CLOUD_IMPORT, SERVER_IMPORT, CLOUDPROXY_IMPORT, SERVER_PATH_IMPORT ]
const sourceIcons = [ CloudBackground, ServerBackground, LocalBackground, ServerBackground ]
const sourceTags = [ 'On a cloud service', 'On a file server', 'On my computer', 'Server Path' ]

const ImportSource = (props) => (
  <div className="ImportSource">
    <div className="Import-back"/>
    <div className="Import-title"><div className="Import-step">Step 1:</div> Where is your stuff?*</div>
    <div className="ImportSource-subtitle">
      * Your assets will stay exactly where they are.
      Zorroa will take a snapshot<br/>
      (we call them proxies) of your data and import it into the system.
    </div>
    <div className="ImportSource-locations">
      { sources.map((source, i) => (
        <div key={source} className="ImportSource-location">
          <div className="flexColCenter">
            <img src={sourceIcons[i]}/>
            { source === CLOUD_IMPORT && (
              <div className="ImportSource-cloud-services">
                { services.map((service, i) => (
                  <img key={service} src={serviceIcons[i]} className="ImportSource-cloud-service" onClick={e => props.onSelect(service, e)}/>
                ))}
              </div>
            )}
          </div>
          <div className="ImportSource-location-overlay">
            <div className="Import-button" onClick={e => props.onSelect(source, e)}>
              {sourceTags[i]}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

ImportSource.propTypes = {
  onSelect: PropTypes.func.isRequired
}

export default ImportSource
