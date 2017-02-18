import React, { PropTypes } from 'react'

import PanZoom from './PanZoom'

const Image = (props) => (
  <div className="Image-frame">
    <PanZoom onMultipage={props.onMultipage}>
      <div className="Image" style={{ backgroundSize: 'fit', backgroundImage: `url(${props.url})` }} />
    </PanZoom>
  </div>
)

Image.propTypes = {
  url: PropTypes.string.isRequired,
  onMultipage: PropTypes.func
}

export default Image
