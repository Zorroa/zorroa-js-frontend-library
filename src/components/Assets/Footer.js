import React, { PropTypes } from 'react'

import AssetCounter from './AssetCounter'
import ThumbSizeSlider from './ThumbSizeSlider'
import ThumbLayoutSelector from './ThumbLayoutSelector'
import TableToggle from './TableToggle'

const Footer = (props) => (
  <div className="assets-footer flexRow flexJustifySpaceBetween flexAlignItemsCenter">
    <div className="flexRow">
      <AssetCounter loaded={props.loaded} total={props.total}/>
    </div>
    <div className="flexRow flexJustifyEnd flexAlignItemsCenter">
      <ThumbSizeSlider value={props.thumbSize} onChange={props.handleThumbSize} />
      <ThumbLayoutSelector thumbLayout={props.layout} onClick={props.handleLayout} />
      <TableToggle enabled={props.showTable} onClick={props.toggleShowTable} />
    </div>
  </div>
)

Footer.propTypes = {
  loaded: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  showTable: PropTypes.bool.isRequired,
  toggleShowTable: PropTypes.func.isRequired,
  layout: PropTypes.string.isRequired,
  handleLayout: PropTypes.func.isRequired,
  thumbSize: PropTypes.number.isRequired,
  handleThumbSize: PropTypes.func.isRequired
}

export default Footer
