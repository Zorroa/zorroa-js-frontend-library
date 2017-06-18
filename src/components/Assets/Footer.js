import React, { PropTypes } from 'react'

import ThumbSizeSlider from './ThumbSizeSlider'
import ThumbLayoutSelector from './ThumbLayoutSelector'
import TableToggle from './TableToggle'
import MultipageToggle from './MultipageToggle'

const Footer = (props) => (
  <div className="assets-footer">
    <ThumbSizeSlider value={props.thumbSize} onChange={props.handleThumbSize} />
    <MultipageToggle enabled={props.showMultipage} onClick={props.toggleShowMultipage}/>
    <ThumbLayoutSelector thumbLayout={props.layout} onClick={props.handleLayout} />
    { props.toggleShowTable && <TableToggle enabled={props.showTable} onClick={props.toggleShowTable} /> }
  </div>
)

Footer.propTypes = {
  loaded: PropTypes.number.isRequired,
  collapsed: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onUncollapse: PropTypes.func.isRequired,
  showTable: PropTypes.bool.isRequired,
  toggleShowTable: PropTypes.func,
  layout: PropTypes.string.isRequired,
  handleLayout: PropTypes.func.isRequired,
  thumbSize: PropTypes.number.isRequired,
  handleThumbSize: PropTypes.func.isRequired,
  showMultipage: PropTypes.bool.isRequired,
  toggleShowMultipage: PropTypes.func.isRequired
}

export default Footer
