import React, { PropTypes } from 'react'
import classnames from 'classnames'

const layouts = [
  { name: 'grid', icon: 'icon-layout2' },
  { name: 'masonry', icon: 'icon-layout3' },
  { name: 'waterfall', icon: 'icon-layout4' },
  { name: 'slideshow', icon: 'icon-layout' }
]

function handleClick (onClick, layout) {
  onClick(layout)
}

const ThumbLayoutSelector = (props) => (
  <div className="thumb-layout">
    { layouts.map(layout => {
      const onClick = handleClick.bind(null, props.onClick, layout.name)
      const classNames = classnames('thumb-layout-button', layout.icon, {
        'thumb-layout-enabled': (layout.name === props.thumbLayout)
      })
      return (<button key={layout.name} className={classNames} onClick={onClick}/>)
    }) }
  </div>
)

ThumbLayoutSelector.propTypes = {
  thumbLayout: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}

export default ThumbLayoutSelector
