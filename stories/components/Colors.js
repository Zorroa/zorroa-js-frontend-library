import React from'react'
import * as variables from '../../src/lib/variables.js'
export default function Colors() {
  const colors = Object.keys(variables).sort((a, b) => a > b ? 1 : -1).filter(variable => variable.search('ZORROA_COLOR_') === 0).map(variable => {
    return {
      name: variable,
      hex: variables[variable],
    }
  })

  return (
    <div className="Colors" style={
{      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap'
}    }>
      {
        colors.map(color =>
          {
            const isLightColor = Number.parseInt(color.hex.substring(1), 16) / (Number.parseInt('FFFFFF', 16) / 2) > 1.5
            const accentColor = isLightColor ? variables.ZORROA_COLOR_BLACK : variables.ZORROA_COLOR_WHITE
            const style={
              backgroundColor: color.hex,
              fontFamily: variables.ZORROA_FONT_FAMILY_BODY,
              padding: `${variables.ZORROA_METRIC_BASE * 2}px`,
              margin: `${variables.ZORROA_METRIC_BASE}px`,
              width: `${variables.ZORROA_METRIC_BASE * 30}px`,
              border: `1px solid ${accentColor}`,
              justifyItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: accentColor,
            }
          return (<div key={color.name} className="Colors__color" style={style}>
            <div>
              {color.name}
            </div>
            <div>
              ${color.name.split('_').join('-').toLowerCase()}
            </div>
            <div>
              {color.hex}
            </div>
          </div>)}
        )
      }
    </div>
  )
}
