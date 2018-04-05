import React, { PropTypes } from 'react'

import ellipsis from '../Header/ellipsis.svg'

const tips = [
  'Your files stay where they are. Zorroa takes a snapshot -- we call them proxies -- of your assets to import. We never touch your original assets.',
  <div>
    You can check the status of imports or add more cloud services, servers, or
    files from your computer from the Imports menu at the top of the screen. It
    will display <img className="ImportingTip-tip-img" src={ellipsis} /> until
    analysis is done.
  </div>,
  'Your assets will continue to import as quickly as possible, so give it a bit or check back later if you have a large number of files.',
]

const ImportingTip = props => (
  <div className="ImportingTip">
    <div className="ImportingTip-title">Your assets are importing!</div>
    <div className="ImportingTip-subtitle">
      Here are some cool things you might want to know about:
    </div>
    <div className="ImportingTip-tips">
      {tips.map((tip, i) => (
        <div className="ImportingTip-tip" key={i}>
          <div className="ImportingTip-tip-icon icon-circle-check" />
          <div className="ImportingTip-label">{tip}</div>
        </div>
      ))}
    </div>
    <div className="ImportingTip-dismiss">
      <div
        onClick={props.onDismiss}
        className="ImportingTip-dismiss-button disabled">
        Dismiss
      </div>
    </div>
  </div>
)

ImportingTip.propTypes = {
  onDismiss: PropTypes.func.isRequired,
}

export default ImportingTip
