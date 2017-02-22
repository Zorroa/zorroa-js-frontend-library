// @flow

import React, { PropTypes } from 'react'
import classnames from 'classnames'

const WidgetHeader = ({ isEnabled, isIconified, header, icon, backgroundColor, enableToggleFn, collapseToggleFn, onClose }: WidgetHeaderProps) => {
  const iconClassNames = classnames('WidgetHeader-icon', icon, { isEnabled, isIconified })

  return (
    <div style={{backgroundColor}} className={classnames('WidgetHeader', {isEnabled})}>
      <div className='WidgetHeader-hover'>
        <div className='WidgetHeader-toggle flexRowCenter fullWidth fullHeight' onClick={collapseToggleFn}>
          <div className={iconClassNames}/>
          { !isIconified && header }
          <div className='flexOn'/>
        </div>
        <div className={classnames('WidgetHeader-enable', {'icon-eye2': isEnabled, 'icon-eye-crossed': !isEnabled, isEnabled})} onClick={enableToggleFn}/>
        { !isIconified && (<div className='WidgetHeader-close icon-cross2' onClick={onClose}/>) }
      </div>
    </div>
    )
}

type WidgetHeaderProps = {
  isEnabled: boolean,
  isIconified: boolean,
  header: Element,
  icon: any,
  backgroundColor: any,
  enableToggleFn: Function,
  collapseToggleFn: Function,
  onClose: Function
}

WidgetHeader.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  isIconified: PropTypes.bool.isRequired,
  header: PropTypes.element.isRequired,
  icon: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  enableToggleFn: PropTypes.func.isRequired,
  collapseToggleFn: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default WidgetHeader
