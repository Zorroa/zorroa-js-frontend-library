import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Image from './Image'
import Asset from '../../models/Asset'

class MultiImage extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
    pages: PropTypes.arrayOf(PropTypes.instanceOf(Asset)).isRequired,
    onMultipage: PropTypes.func.isRequired,
    origin: PropTypes.string,
    actions: PropTypes.object
  }

  state = {
    pageIndex: 0
  }

  componentWillMount () {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps (props) {
    const { pages } = props
    if (pages) {
      const pageIndex = pages.findIndex(page => page.id === props.id)
      this.setState({pageIndex})
    }
  }

  nextPage = () => {
    const { pages } = this.props
    const pageIndex = Math.min(this.state.pageIndex + 1, pages.length - 1)
    this.setState({pageIndex})
  }

  prevPage = () => {
    const pageIndex = Math.max(this.state.pageIndex - 1, 0)
    this.setState({pageIndex})
  }

  render () {
    const { pages, onMultipage, origin } = this.props
    const { pageIndex } = this.state
    const title = pages && pageIndex < pages.length && `Page ${pageIndex + 1} / ${pages.length}`
    const page = pages && pages[pageIndex]
    const url = page.biggestProxy().url(origin)
    return <Image title={title} url={url} onMultipage={onMultipage}
                  onNextPage={pages && pageIndex < pages.length - 1 ? this.nextPage : null}
                  onPrevPage={pages && pageIndex > 0 && pages.length ? this.prevPage : null}/>
  }
}

export default connect(state => ({
  origin: state.auth.origin,
  pages: state.assets.pages
}))(MultiImage)
