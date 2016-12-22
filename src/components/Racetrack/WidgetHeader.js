import React, { PropTypes } from 'react'
import classnames from 'classnames'

const WidgetHeader = ({ isIconified, header, icon, backgroundColor, onToggle, onClose }) => {
  const iconClassNames = classnames('WidgetHeader-icon', icon, { isIconified })

  return (
    <div style={{backgroundColor}} className='WidgetHeader'>
      <div className='WidgetHeader-hover'>
        <div className='WidgetHeader-toggle flexRowCenter fullWidth fullHeight' onClick={onToggle}>
          <div className={iconClassNames}/>
          { !isIconified && header }
          <div className='flexOn'/>
        </div>
        {
          !isIconified && (<div className='WidgetHeader-close icon-cross2' onClick={onClose}/>)
        }
      </div>
    </div>
    )
}

WidgetHeader.propTypes = {
  isIconified: PropTypes.bool.isRequired,
  header: PropTypes.element.isRequired,
  icon: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default WidgetHeader
