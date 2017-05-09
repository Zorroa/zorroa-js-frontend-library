import React, { PropTypes } from 'react'

import DropboxLogo from './DropboxLogo.svg'
import GDriveLogo from './GDriveLogo.svg'
import BoxLogo from './BoxLogo.svg'
import { DropboxAuthenticator } from './DropboxAuthenticator'
import { BoxAuthenticator } from './BoxAuthenticator'

import { DROPBOX_CLOUD, BOX_CLOUD, GDRIVE_CLOUD } from './ImportConstants'

const logos = [ DropboxLogo, GDriveLogo, BoxLogo ]
const clouds = [ DROPBOX_CLOUD, GDRIVE_CLOUD, BOX_CLOUD ]

const ImportCloud = (props) => {
  const auths = [
    new DropboxAuthenticator('6fifppvd9maxou9', accessToken => {
      if (accessToken && accessToken.length && accessToken !== 'undefined') {
        props.onSelect(DROPBOX_CLOUD, accessToken)
      } else {
        DropboxAuthenticator.deauthorize()
      }
    }),
    null,
    new BoxAuthenticator('nvjb3koff9j86go05crt24o0br60gk2r', accessToken => {
      if (accessToken && accessToken.length && accessToken !== 'undefined') {
        props.onSelect(BOX_CLOUD, accessToken)
      } else {
        BoxAuthenticator.deauthorize()
      }
    })
  ]
  clouds.forEach((c, i) => { if (props.launch === c) requestAnimationFrame(auths[i].authorize) })
  return (
    <div className="ImportCloud">
      <div className="Import-back" onClick={props.onBack}>
        <div className="icon-chevron-right" style={{transform: 'rotate(180deg)'}}/>
        Back
      </div>
      <div className="Import-title">
        <div className="Import-step">Step 2:</div>
        Authentication to Cloud Service
      </div>
      <div className="ImportCloud-services">
        { clouds.map((c, i) => (
          <div className="ImportCloud-service" key={i}>
            <img className="ImportCloud-logo" src={logos[i]}/>
            <div onClick={e => auths[i].authorize()} className="Import-button">
              Authenticate
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

ImportCloud.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  launch: PropTypes.string
}

export default ImportCloud
