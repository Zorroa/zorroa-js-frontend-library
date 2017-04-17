import React, { PropTypes } from 'react'
import classnames from 'classnames'

const WidgetHeader = ({ isEnabled, isIconified, title, field, icon, backgroundColor, enableToggleFn, collapseToggleFn, onClose }) => {
  const iconClassNames = classnames('WidgetHeader-icon', icon, { isEnabled, isIconified })

  return (
    <div style={{backgroundColor}} className={classnames('WidgetHeader', {isEnabled})}>
      <div className='WidgetHeader-hover'>
        <div className='WidgetHeader-toggle flexRowCenter fullWidth fullHeight' onClick={collapseToggleFn}>
          <div className={iconClassNames}/>
          { !isIconified && (
            <div className="WidgetHeader-header">
              <div className="WidgetHeader-header-label">
                <span className="WidgetHeader-header-title">{title}{field && field.length ? ':' : ''}</span>
                { field && <span className="WidgetHeader-header-field">{field}</span> }
              </div>
            </div>
          ) }
          <div className='flexOn'/>
        </div>
        { !isIconified && enableToggleFn && (<div className={classnames('WidgetHeader-enable', {'icon-eye2': isEnabled, 'icon-eye-crossed': !isEnabled, isEnabled})} onClick={enableToggleFn}/>) }
        { !isIconified && (<div className='WidgetHeader-close icon-cross2' onClick={onClose}/>) }
      </div>
    </div>
  )
}

WidgetHeader.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  isIconified: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  field: PropTypes.string,
  icon: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  enableToggleFn: PropTypes.func,
  collapseToggleFn: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default WidgetHeader
