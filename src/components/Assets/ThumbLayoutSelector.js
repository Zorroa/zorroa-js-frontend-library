import React, { PropTypes } from 'react'
import classnames from 'classnames'

const layouts = [
  { name: 'grid', icon: 'icon-layout2', title: 'Grid layout' },
  { name: 'masonry', icon: 'icon-layout3', title: 'Flow layout' },
]

function handleClick(onClick, layout) {
  onClick(layout)
}

const ThumbLayoutSelector = props => (
  <div className="thumb-layout">
    {layouts.map(layout => {
      const onClick = handleClick.bind(null, props.onClick, layout.name)
      const classNames = classnames('Footer__icon', layout.icon, {
        'Footer__icon--enabled': layout.name === props.thumbLayout,
      })
      return (
        <div
          key={layout.name}
          title={layout.title}
          className={classNames}
          onClick={onClick}
        />
      )
    })}
  </div>
)

ThumbLayoutSelector.propTypes = {
  thumbLayout: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default ThumbLayoutSelector
