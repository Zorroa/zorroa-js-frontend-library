import React, { PropTypes } from 'react'

// Helpers to compute width because we use {left:0, right:0, margin-left:auto, margin-right:auto}
const showPages = (props) => (props.onNextPage || props.onPrevPage)
const showZoom = (props) => (props.onZoomIn || props.onZoomOut || props.onFit)
const showMultipage = (props) => (props.onMonopage || props.onMultipage)
const iconCount = (props) => ((showZoom(props) ? 3 : 0) + (showMultipage(props) ? 2 : 0) + (showPages(props) ? 2 : 0))
const width = (props) => (32 * iconCount(props) + 20 + (props.title ? props.title.length * 10 : 0))

const Controlbar = (props) => (
  <div className="Controlbar" style={{width: width(props)}}>
    { props.title && <div className="Controlbar-title">{props.title}</div> }
    { showPages(props) && (
        <div className="Controlbar-section">
          <button disabled={!props.onPrevPage} className="icon-frame-back" onClick={props.onPrevPage} />
          <button disabled={!props.onNextPage} className="icon-frame-forward" onClick={props.onNextPage} />
        </div>
    )}
    { (props.title || showPages(props)) && (showZoom(props) || showMultipage(props)) && <div className="Controlbar-separator" /> }
    { showZoom(props) && (
        <div className="Controlbar-section">
          <button disabled={!props.onZoomOut} className="Controlbar-zoom-out icon-zoom-out" onClick={props.onZoomOut} />
          <button disabled={!props.onFit} className="Controlbar-zoom-reset icon-expand3" onClick={props.onFit} />
          <button disabled={!props.onZoomIn} className="Controlbar-zoom-in icon-zoom-in" onClick={props.onZoomIn} />
        </div>
      ) }
    { showZoom(props) && showMultipage(props) && <div className="Controlbar-separator" /> }
    { showMultipage(props) && (
        <div className="Controlbar-section">
          <button disabled={!props.onMonopage} className="icon-checkbox-empty" onClick={props.onMonopage} />
          <button disabled={!props.onMultipage} className="icon-icons2" onClick={props.onMultipage} />
        </div>
      ) }
  </div>
)

Controlbar.propTypes = {
  title: PropTypes.string,
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func,
  onFit: PropTypes.func,
  onNextPage: PropTypes.func,
  onPrevPage: PropTypes.func,
  onMonopage: PropTypes.func,
  onMultipage: PropTypes.func
}

export default Controlbar
