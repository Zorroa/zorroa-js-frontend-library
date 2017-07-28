import React, { PropTypes } from 'react'
import ReactPlayer from 'react-player'

const TutorialVideos = (props) => (
  <div className="TutorialVideos">
    <div onClick={props.onDismiss} className="TutorialVideos-cancel icon-cross"/>
    <div className="TutorialVideos-title">
      While we're waiting for your assets to be analyzed, let's watch some tutorials
    </div>
    <ReactPlayer
      url="https://www.youtube.com/watch?v=7r9E6bn5bxY&list=PLQqS0BVI3mPGufVivRzSuxqHhb-y92I7m"
      controls={true}
      width="60vw" height="34vw"
    />
    <div className="TutorialVideos-footer">
      Tutorials, release notes, and documentation can always be accessed via the HELP menu
    </div>
    <div className="TutorialVideos-dismiss">
      <div onClick={props.onDismiss} className="TutorialVideos-dismiss-button disabled">
        Dismiss
      </div>
    </div>
  </div>
)

TutorialVideos.propTypes = {
  onDismiss: PropTypes.func.isRequired
}

export default TutorialVideos
