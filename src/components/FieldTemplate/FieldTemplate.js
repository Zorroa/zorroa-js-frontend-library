import React, { PropTypes } from 'react'

import TableField from '../Table/TableField'
import { parseVariables } from '../../services/jsUtil'

function metadataBadge (fieldTemplate, asset) {
  if (!fieldTemplate || !asset) return
  const vars = parseVariables(fieldTemplate)
  if (!vars || !vars.length) return
  const fields = vars.map(re => {
    const key = re.slice(2, -1)
    const fields = key.split('|')
    let field
    for (let i = 0; i < fields.length; ++i) {
      field = fields[i]
      if (asset.rawValue(field)) break
      field = null
    }
    if (field) return <TableField asset={asset} field={field}/>
    return <div/>
  })
  // If template syntax changes, see also jsUtil.js:parseVariables
  const text = fieldTemplate.replace(/%{[a-zA-Z0-9.|]*}/g, '%%')
  const texts = text.split('%%')
  const elems = texts.map((t, i) => (<div className="FieldTemplate-field" key={i}><div className="FieldTemplate-label">{t}</div>{fields[i]}</div>))
  return <div className="FieldTemplate">{elems}</div>
}

const FieldTemplate = (props) => (
  <div className="FieldTemplate">
    { metadataBadge(props.template, props.asset) }
  </div>
)

FieldTemplate.propTypes = {
  asset: PropTypes.object.isRequired,
  template: PropTypes.string.isRequired
}

export default FieldTemplate
