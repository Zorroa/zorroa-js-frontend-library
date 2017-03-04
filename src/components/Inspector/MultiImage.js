import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Image from './Image'
import Asset from '../../models/Asset'
import { searchDocument } from '../../actions/assetsAction'

class MultiImage extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
    pages: PropTypes.arrayOf(PropTypes.instanceOf(Asset)).isRequired,
    onMultipage: PropTypes.func.isRequired,
    protocol: PropTypes.string,
    host: PropTypes.string,
    actions: PropTypes.object
  }

  state = {
    pageIndex: 0
  }

  componentWillMount () {
    const { parentId, actions } = this.props
    const order = [{ field: 'source.clip.page.start', ascending: true }]
    actions.searchDocument(null, parentId, order)
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
    const { pages, onMultipage, protocol, host } = this.props
    const { pageIndex } = this.state
    const title = pages && pageIndex < pages.length && `Page ${pageIndex + 1} / ${pages.length}`
    const page = pages && pages[pageIndex]
    const url = page.biggestProxy().url(protocol, host)
    return <Image title={title} url={url} onMultipage={onMultipage}
                  onNextPage={pages && pageIndex < pages.length - 1 && this.nextPage}
                  onPrevPage={pages && pageIndex > 0 && pages.length && this.prevPage}/>
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host,
  pages: state.assets.pages
}), dispatch => ({
  actions: bindActionCreators({
    searchDocument
  }, dispatch)
}))(MultiImage)
