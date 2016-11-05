import React, { PropTypes } from 'react'
import classnames from 'classnames'

const WidgetHeader = ({ isIconified, header, icon, onToggle, onClose }) => {
  const iconClassNames = classnames('WidgetHeader-icon', icon, { isIconified })

  return (
    <div className={classnames('WidgetHeader', 'flexCenter', 'flexAlignItemsCenter', 'fullWidth')}>
      <div className='WidgetHeader-toggle flexRowCenter fullWidth fullHeight' onClick={onToggle}>
        <div className={iconClassNames}/>
        { !isIconified && header }
        <div className='flexOn'/>
      </div>
      {
        !isIconified && (
          <div className='WidgetHeader-close flexOff flexCenter fullHeight' onClick={onClose}>
            <div className='icon-cross2'/>
          </div>
        )
      }
    </div>
    )
}

WidgetHeader.propTypes = {
  isIconified: PropTypes.bool.isRequired,
  header: PropTypes.element.isRequired,
  icon: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default WidgetHeader
