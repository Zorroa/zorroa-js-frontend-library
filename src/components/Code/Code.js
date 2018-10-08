import React from 'react'
import PropTypes from 'prop-types'

import 'brace'
import AceEditor from 'react-ace'
import 'brace/mode/javascript'
import 'brace/theme/dawn'

export default function Code({ name, defaultValue }) {
  return (
    <div className="Code">
      <AceEditor
        mode="javascript"
        theme="dawn"
        readOnly={true}
        showGutter={false}
        name={name}
        defaultValue={defaultValue.trim()}
        highlightActiveLine={false}
        height={'200px'}
      />
    </div>
  )
}

Code.propTypes = {
  name: PropTypes.string.isRequired,
  defaultValue: PropTypes.string.isRequired,
}
