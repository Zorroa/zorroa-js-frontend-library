import React, { PropTypes } from 'react'
import classnames from 'classnames'

import pin from './pin.svg'

const WidgetHeader = ({ isEnabled, isPinned, isOpen, isIconified, maxWidth, title, field, icon, backgroundColor, enableToggleFn, collapseToggleFn, pinnedToggleFn, onClose }) => {
  const iconClassNames = classnames('WidgetHeader-icon', icon, { isEnabled, isIconified })
  return (
    <div style={{backgroundColor, maxWidth}} className={classnames('WidgetHeader', {isEnabled})}>
      { !isIconified && (<div className='WidgetHeader-close icon-cancel-circle' onClick={onClose}/>) }
      <div className='WidgetHeader-hover'>
        <div className='WidgetHeader-toggle flexRowCenter fullWidth fullHeight' onClick={collapseToggleFn}>
          <div className={iconClassNames}/>
          { !isIconified && (
            <div className="WidgetHeader-header">
              <div className="WidgetHeader-header-label">
                { title && <span className="WidgetHeader-header-title">{title}{field && field.length ? ':' : ''}</span> }
                { field && <span className="WidgetHeader-header-field">{field}</span> }
              </div>
            </div>
          ) }
          { collapseToggleFn && <div className={classnames('WidgetHeader-collapse', 'icon-chevron-down', {isOpen})}/> }
          <div className='flexOn'/>
        </div>
        { !isIconified && pinnedToggleFn && (<div className="WidgetHeader-pin" onClick={pinnedToggleFn}><img className={classnames('WidgetHeader-pin-img', {isPinned})} src={pin}/></div>) }
        { !isIconified && enableToggleFn && (<div className={classnames('WidgetHeader-enable', {'icon-eye2': isEnabled, 'icon-eye-crossed': !isEnabled, isEnabled})} onClick={enableToggleFn}/>) }
      </div>
    </div>
  )
}

WidgetHeader.propTypes = {
  isPinned: PropTypes.bool.isRequired,
  isEnabled: PropTypes.bool.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isIconified: PropTypes.bool.isRequired,
  maxWidth: PropTypes.number,
  title: PropTypes.string,
  field: PropTypes.string,
  icon: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  enableToggleFn: PropTypes.func,
  collapseToggleFn: PropTypes.func,
  pinnedToggleFn: PropTypes.func,
  onClose: PropTypes.func.isRequired
}

export default WidgetHeader
