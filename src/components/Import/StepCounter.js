import React, { PropTypes } from 'react'
import classnames from 'classnames'

const StepCounter = (props) => (
  <div className="StepCounter">
    <div className="StepCounter-line"/>
    { Array(props.count).fill(0).map((v, i) => (
      <div key={i} className={classnames('StepCounter-step', {selected: i + 1 === props.step})}>{i + 1}</div>
    )) }
  </div>
)

StepCounter.propTypes = {
  step: PropTypes.number.isRequired,
  count: PropTypes.number
}

StepCounter.defaultProps = {
  step: 1,
  count: 3
}

export default StepCounter
