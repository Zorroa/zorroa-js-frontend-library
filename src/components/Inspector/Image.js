import React, { PropTypes } from 'react'

import PanZoom from './PanZoom'

const Image = props => (
  <div className="Image-frame">
    <PanZoom
      title={props.title}
      onNextPage={props.onNextPage}
      onPrevPage={props.onPrevPage}>
      <div
        className="Image"
        style={{ backgroundSize: 'fit', backgroundImage: `url(${props.url})` }}
      />
    </PanZoom>
  </div>
)

Image.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
  onNextPage: PropTypes.func,
  onPrevPage: PropTypes.func,
}

export default Image
