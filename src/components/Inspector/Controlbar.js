import React, { PropTypes } from 'react'

import VolumeBar from './VolumeBar'

// Helpers to compute width because we use {left:0, right:0, margin-left:auto, margin-right:auto}
const showVideo = (props) => (!!props.onVideo)
const showVolume = (props) => (!!props.onVolume)
const showZoom = (props) => (props.onZoomIn || props.onZoomOut || props.onFit)
const iconCount = (props) => ((showVideo(props) ? 5 : 0) + (showZoom(props) ? 3 : 0))
const titleWidth = (props) => (props.titleWidth || (props.title ? props.title.length * 10 : 0))
const width = (props) => (32 * iconCount(props) + 20 + titleWidth(props) + 120 * showVolume(props))

const Controlbar = (props) => (
  <div className="Controlbar" style={{width: width(props)}}>
    { props.title && <div className="Controlbar-title">{props.title}</div> }
    { props.title && <div className="Controlbar-separator" /> }
    { showVideo(props) && (
      <div className="Controlbar-section">
        <button onClick={e => props.onVideo('rewind', e)} className="icon-prev-clip"/>
        <button onClick={e => props.onVideo('frameBack', e)} className="icon-frame-back"/>
        <div onClick={e => props.onVideo('play', e)} className="Video-play">
          <button className={props.playing ? 'icon-pause' : 'icon-play3'} />
        </div>
        <button onClick={e => props.onVideo('frameForward', e)} className="icon-frame-forward"/>
        <button onClick={e => props.onVideo('fastForward', e)} className="icon-next-clip"/>
      </div>
    )}
    { showVideo(props) && showVolume(props) && <div className="Controlbar-separator" /> }
    { showVolume(props) && (
      <div className="Controlbar-section">
        <VolumeBar volume={props.volume} onVolume={props.onVolume}/>
      </div>
    )}
    { (props.title) && showZoom(props) && <div className="Controlbar-separator" /> }
    { showZoom(props) && (
        <div className="Controlbar-section">
          <button disabled={!props.onZoomOut} className="Controlbar-zoom-out icon-zoom-out" onClick={props.onZoomOut} />
          <button disabled={!props.onFit} className="Controlbar-zoom-reset icon-expand3" onClick={props.onFit} />
          <button disabled={!props.onZoomIn} className="Controlbar-zoom-in icon-zoom-in" onClick={props.onZoomIn} />
        </div>
      ) }
    { showZoom(props) && <div className="Controlbar-separator" /> }
  </div>
)

Controlbar.propTypes = {
  title: PropTypes.node,
  titleWidth: PropTypes.number,
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func,
  onFit: PropTypes.func,
  onNextPage: PropTypes.func,
  onPrevPage: PropTypes.func,
  onVideo: PropTypes.func,
  playing: PropTypes.bool,
  onVolume: PropTypes.func,
  volume: PropTypes.number
}
Controlbar.defaultProps = {
  titleWidth: 0
}
export default Controlbar
