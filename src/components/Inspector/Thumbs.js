import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Thumb, { page } from '../Thumb'
import Asset from '../../models/Asset'
import * as ComputeLayout from '../Assets/ComputeLayout.js'

class Thumbs extends Component {
  static propTypes = {
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    thumbSize: PropTypes.number.isRequired,
    onMonopage: PropTypes.func.isRequired,
    protocol: PropTypes.string,
    host: PropTypes.string
  }

  state = {
    positions: [],
    scrollHeight: 0,
    scrollWidth: 0,
    selected: new Set(),
    lastSelectedId: null
  }

  componentWillMount () {
    this.queueLayout()
  }

  componentWillReceiveProps (nextProps) {
    if (this.cachedThumbSize !== nextProps.thumbSize) {
      this.queueLayout()
    }
  }

  select = (asset, event) => {
    let selected = new Set(this.state.selected)
    if (event.shiftKey) {
      const { assets } = this.props
      const { lastSelectedId } = this.state
      const lastSelectedIndex = assets.findIndex(a => (a.id === lastSelectedId))
      if (lastSelectedIndex >= 0) {
        const index = assets.findIndex(a => (a.id === asset.id))
        if (index >= 0) {
          selected = new Set()
          const min = Math.min(index, lastSelectedIndex)
          const max = Math.max(index, lastSelectedIndex)
          for (var i = min; i <= max; ++i) {
            selected.add(assets[i].id)
          }
        }
      }
    } else if (event.metaKey) {
      if (selected.has(asset.id)) {
        selected.delete(asset.id)
        if (!selected.size) this.setState({lastSelectedId: null})
      } else {
        selected.add(asset.id)
        this.setState({lastSelectedId: asset.id})
      }
    } else {
      if (this.state.selected.size === 1 && selected.has(asset.id)) {
        selected = new Set()
        this.setState({lastSelectedId: null})
      } else {
        selected = new Set([asset.id])
        this.setState({lastSelectedId: asset.id})
      }
    }
    this.setState({selected})
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
    const { positions, selected } = this.state
    const { assets, protocol, host } = this.props
    if (!positions || !assets || positions.length !== assets.length) {
      return <div className="Thumbs" ref={this.updateElement} />
    }
    return (
      <div className="Thumbs" ref={this.updateElement}>
        <div className="Thumbs-body">
          { assets.map((asset, i) => {
            const dim = positions[i]
            const { width, height } = dim
            return <Thumb key={asset.id}
                          pages={[page(asset, width, height, protocol, host)]}
                          dim={dim}
                          isSelected={selected.has(asset.id)}
                          onClick={e => this.select(asset, e)}
                          onDoubleClick={e => this.props.onMonopage(asset, e)}/>
          })}
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  protocol: state.auth.protocol,
  host: state.auth.host,
  thumbSize: state.app.thumbSize
}))(Thumbs)
