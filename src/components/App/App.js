import React, { Component, PropTypes } from 'react'
import { EMBEDMODE_ITEM } from '../../constants/localStorageItems'
import domUtils from '../../services/domUtils'

class App extends Component {
  static propTypes = {
    children: PropTypes.object
  }

  componentWillMount () {
    var queryParams = domUtils.parseQueryString(window.location.search)
    if (queryParams.EmbedMode) {
      localStorage.setItem(EMBEDMODE_ITEM, queryParams.EmbedMode)
    }
  }

  render () {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

export default App
