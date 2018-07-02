import React, { PropTypes } from 'react'

import ThumbSizeSlider from './ThumbSizeSlider'
import ThumbLayoutSelector from './ThumbLayoutSelector'
import TableToggle from './TableToggle'
import MultipageToggle from './MultipageToggle'

const Footer = props => (
  <div className="assets-footer">
    <ThumbSizeSlider value={props.thumbSize} onChange={props.handleThumbSize} />
    <ThumbLayoutSelector
      thumbLayout={props.layout}
      onClick={props.handleLayout}
    />
    <MultipageToggle
      enabled={props.showMultipage}
      onClick={props.toggleShowMultipage}
    />
    <TableToggle
      enabled={props.showTable}
      onClick={event => {
        if (typeof props.toggleShowTable === 'function') {
          props.toggleShowTable(event)
        }
      }}
    />
  </div>
)

Footer.propTypes = {
  showTable: PropTypes.bool.isRequired,
  toggleShowTable: PropTypes.func,
  layout: PropTypes.string.isRequired,
  handleLayout: PropTypes.func.isRequired,
  thumbSize: PropTypes.number.isRequired,
  handleThumbSize: PropTypes.func.isRequired,
  showMultipage: PropTypes.bool.isRequired,
  toggleShowMultipage: PropTypes.func.isRequired,
}

export default Footer
