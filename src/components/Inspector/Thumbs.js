import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Thumb, { page, monopageBadges } from '../Thumb'
import Asset from '../../models/Asset'
import { selectPageAssetIds } from '../../actions/assetsAction'
import * as ComputeLayout from '../Assets/ComputeLayout.js'

class Thumbs extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    thumbSize: PropTypes.number.isRequired,
    selectedIds: PropTypes.instanceOf(Set),
    onMonopage: PropTypes.func.isRequired,
    protocol: PropTypes.string,
    host: PropTypes.string,
    actions: PropTypes.object.isRequired
  }

  state = {
    positions: [],
    scrollHeight: 0,
    scrollWidth: 0,
    lastSelectedId: null
  }

  componentWillMount () {
    this.queueLayout()
    this.props.actions.selectPageAssetIds() // clear
  }

  componentWillUnmount () {
    this.props.actions.selectPageAssetIds() // avoid disable action flicker
  }

  componentWillReceiveProps (nextProps) {
    if (this.cachedThumbSize !== nextProps.thumbSize) {
      this.queueLayout()
    }
  }

  select = (asset, event) => {
    let selectedIds = new Set(this.props.selectedIds)
    if (event.shiftKey) {
      const { assets } = this.props
      const { lastSelectedId } = this.state
      const lastSelectedIndex = assets.findIndex(a => (a.id === lastSelectedId))
      if (lastSelectedIndex >= 0) {
        const index = assets.findIndex(a => (a.id === asset.id))
        if (index >= 0) {
          selectedIds = new Set()
          const min = Math.min(index, lastSelectedIndex)
          const max = Math.max(index, lastSelectedIndex)
          for (var i = min; i <= max; ++i) {
            selectedIds.add(assets[i].id)
          }
        }
      }
    } else if (event.metaKey) {
      if (selectedIds.has(asset.id)) {
        selectedIds.delete(asset.id)
        if (!selectedIds.size) this.setState({lastSelectedId: null})
      } else {
        selectedIds.add(asset.id)
        this.setState({lastSelectedId: asset.id})
      }
    } else {
      if (this.props.selectedIds && this.props.selectedIds.size === 1 && selectedIds.has(asset.id)) {
        selectedIds = new Set()
        this.setState({lastSelectedId: null})
      } else {
        selectedIds = new Set([asset.id])
        this.setState({lastSelectedId: asset.id})
      }
    }
    this.props.actions.selectPageAssetIds(selectedIds)
  }

  updateElement = (element) => {
    this.scrollElement = element
    if (element) {
      if (this.updateInterval) clearInterval(this.updateInterval)
      this.updateInterval = setInterval(this.updateLayout, 150)
    } else {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      this.clearLayoutTimer()
    }
  }

  updateLayout = () => {
    const scroll = this.scrollElement
    if (!scroll) return

    if (scroll.clientHeight !== this.state.scrollHeight ||
      scroll.clientWidth !== this.state.scrollWidth) {
      this.setState({
        scrollHeight: scroll.clientHeight,
        scrollWidth: scroll.clientWidth
      })
      this.queueLayout()
    }
  }

  runLayout = () => {
    const width = this.state.scrollWidth
    const { assets, thumbSize } = this.props
    if (!width || !assets || !thumbSize) return

    const dims = assets.map(page => {
      const width = page.width() || (page.proxies && page.proxies[0].width) || 1
      const height = page.height() || (page.proxies && page.proxies[0].height) || 1
      return { width, height }
    })
    const { positions } = ComputeLayout.masonry(dims, width, thumbSize)
    this.setState({ positions })
    this.clearLayoutTimer()
    this.cachedThumbSize = thumbSize
  }

  queueLayout = () => {
    this.clearLayoutTimer()
    this.layoutTimer = setTimeout(this.runLayout, 150)
  }

  clearLayoutTimer = () => {
    if (this.layoutTimer) clearTimeout(this.layoutTimer)
    this.layoutTimer = null
  }

  render () {
    const { positions } = this.state
    const { assets, protocol, host, thumbSize, selectedIds } = this.props
    if (!positions || !assets || positions.length !== assets.length) {
      return <div className="Thumbs" ref={this.updateElement} />
    }
    return (
      <div className="Thumbs" ref={this.updateElement}>
        <div className="Thumbs-body">
          { assets.map((asset, i) => {
            const { pageBadge } = monopageBadges(asset, protocol, host, -1, thumbSize < 100 ? 15 : 25)
            const dim = positions[i]
            const { width, height } = dim
            return <Thumb key={asset.id}
                          pages={[page(asset, width, height, protocol, host)]}
                          dim={dim}
                          pageBadge={pageBadge}
                          isSelected={selectedIds && selectedIds.has(asset.id)}
                          onClick={e => this.select(asset, e)}
                          onDoubleClick={e => this.props.onMonopage(asset, e)}/>
          })}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  selectedIds: state.assets.selectedPageIds,
  protocol: state.auth.protocol,
  host: state.auth.host,
  thumbSize: state.app.thumbSize
}), dispatch => ({
  actions: bindActionCreators({selectPageAssetIds}, dispatch)
}))(Thumbs)
