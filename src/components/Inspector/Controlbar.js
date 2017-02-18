import React, { PropTypes } from 'react'

// Helpers to compute width because we use {left:0, right:0, margin-left:auto, margin-right:auto}
const showZoom = (props) => (props.onZoomIn || props.onZoomOut || props.onFit)
const showMultipage = (props) => (props.onMonopage || props.onMultipage)
const iconCount = (props) => ((showZoom(props) ? 3 : 0) + (showMultipage(props) ? 2 : 0))
const width = (props) => (32 * iconCount(props) + 20)

const Controlbar = (props) => (
  <div className="Controlbar" style={{width: width(props)}}>
    { props.title && <div className="Controlbar-title">{props.title}</div> }
    { showZoom(props) ? (
        <div className="Controlbar-panzoom">
          <button disabled={!props.onZoomOut} className="icon-zoom-out" onClick={props.onZoomOut} />
          <button disabled={!props.onFit} className="icon-expand3" onClick={props.onFit} />
          <button disabled={!props.onZoomIn} className="icon-zoom-in" onClick={props.onZoomIn} />
        </div>
      ) : null }
    { showMultipage(props) ? (
        <div className="Controlbar-multipage">
          <button disabled={!props.onMonopage} className="icon-checkbox-empty" onClick={props.onMonopage} />
          <button disabled={!props.onMultipage} className="icon-icons2" onClick={props.onMultipage} />
        </div>
      ) : null }
  </div>
)

Controlbar.propTypes = {
  title: PropTypes.string,
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func,
  onFit: PropTypes.func,
  onMonopage: PropTypes.func,
  onMultipage: PropTypes.func
}

export default Controlbar
