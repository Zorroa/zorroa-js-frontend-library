import PropTypes from 'prop-types'
import React from 'react'

import PanZoom from './PanZoom'
import Image from '../Image'

const ImageInspector = props => (
  <div className="ImageInspector-frame">
    <PanZoom
      title={props.title}
      onNextPage={props.onNextPage}
      onPrevPage={props.onPrevPage}>
      <Image url={props.url} />
    </PanZoom>
  </div>
)

ImageInspector.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
  onNextPage: PropTypes.func,
  onPrevPage: PropTypes.func,
}

export default ImageInspector
