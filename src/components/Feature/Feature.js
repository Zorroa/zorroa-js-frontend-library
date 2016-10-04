import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Assets from '../Assets'

class Feature extends Component {
  static propTypes () {
    return {
      assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset))
    }
  }

  render () {
    return (
      <div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  assets: state.assets.all
})

export default connect(mapStateToProps)(Feature)
