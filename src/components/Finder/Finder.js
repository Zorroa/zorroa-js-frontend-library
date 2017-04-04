import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class Finder extends Component {
  static propTypes = {
    items: PropTypes.instanceOf(Map).isRequired,   // {id: {id, name, childIds}}
    rootId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    openIcon: PropTypes.node,
    closeIcon: PropTypes.node,
    onOpen: PropTypes.func,
    onSelect: PropTypes.func
  }

  static defaultProps = {
    rootId: 0,
    openIcon: <div className="icon-square-plus"/>,
    closeIcon: <div className="icon-square-minus"/>
  }

  state = {
    order: 'alpha-asc',
    opened: new Set(),
    selected: new Set()
  }

  componentWillReceiveProps (nextProps) {
    if (!this.state.opened.has(nextProps.rootId)) {
      const opened = new Set(this.state.opened)
      opened.add(nextProps.rootId)
      this.setState({opened})
    }
  }

  flatten (parent, depth, files) {
    if (!parent) return
    if (depth > 0) files.push(parent)
    const { items } = this.props
    const { order, opened } = this.state
    if (!parent.childIds || !opened.has(parent.id)) return
    const sorter = this.sort(order)
    const kids = [...parent.childIds].map(id => ({...items.get(id), depth})).sort(sorter)
    kids.forEach(kid => { this.flatten(kid, depth + 1, files) })
  }

  sort (order) {
    switch (order) {
      case 'alpha-asc': return (a, b) => a.name.localeCompare(b.name)
      case 'alpha-desc': return (a, b) => b.name.localeCompare(a.name)
    }
  }

  open = (id, event) => {
    const opened = new Set(this.state.opened)
    if (opened.has(id)) {
      opened.delete(id)
    } else {
      opened.add(id)
    }
    this.setState({opened})
    if (this.props.onOpen) this.props.onOpen(id, opened, event)
  }

  select = (id, event) => {
    const selected = new Set(this.state.selected)
    if (selected.has(id)) {
      selected.delete(id)
    } else {
      selected.add(id)
    }
    this.setState({selected})
    if (this.props.onSelect) this.props.onSelect(id, selected, event)
  }

  renderPads (depth) {
    if (depth <= 0) return null
    let pads = []
    for (let i = 0; i < depth; ++i) pads.push(<div key={i} className="Finder-pad"/>)
    return pads
  }

  render () {
    const { items, rootId, openIcon, closeIcon } = this.props
    const { opened, selected } = this.state
    const files = []
    this.flatten(items.get(rootId), 0, files)
    return (
      <div className="Finder">
        { files.map(file => (
          <div key={file.id}
               className={classnames('Finder-file', {selected: selected.has(file.id)})}>
            { this.renderPads(file.depth) }
            <div className="Finder-file-icon"
                 onClick={file.childIds && (e => this.open(file.id, e))}>
              { file.childIds && (opened.has(file.id) ? closeIcon : openIcon) }
            </div>
            <div className="Finder-file-name"
                 onClick={e => this.select(file.id, e)}>{file.name}</div>
          </div>
        ))}
      </div>
    )
  }
}
