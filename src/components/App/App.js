import React, { Component, PropTypes } from 'react'
import { EMBEDMODE_ITEM, LOAD_SEARCH_ITEM } from '../../constants/localStorageItems'
import domUtils from '../../services/domUtils'

class App extends Component {
  static propTypes = {
    children: PropTypes.object
  }

  componentWillMount () {
    var queryParams = domUtils.parseQueryString(window.location.search)
    if (queryParams[EMBEDMODE_ITEM]) {
      localStorage.setItem(EMBEDMODE_ITEM, queryParams[EMBEDMODE_ITEM])
    }
    if (queryParams[LOAD_SEARCH_ITEM]) {
      localStorage.setItem(LOAD_SEARCH_ITEM, queryParams[LOAD_SEARCH_ITEM])
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
