import classnames from 'classnames'

import Sidebar from '../Sidebar'

export default class Footer extends Sidebar {
  static displayName () {
    return 'Footer'
  }

  buttonChar () {
    // Select the right or left facing triangle unicode char using XOR
    return this.state.open !== this.props.isRightEdge ? '\u25BC' : '\u25B2'
  }

  buttonClassNames () {
    return 'footer-button'
  }

  sidebarClassNames () {
    return classnames('footer', {
      'footer-open': this.state.open
    })
  }
}
