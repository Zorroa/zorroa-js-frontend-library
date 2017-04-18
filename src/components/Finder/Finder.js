import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import { selectId } from '../../services/jsUtil'
import Filter from '../Filter'

export default class Finder extends Component {
  static propTypes = {
    items: PropTypes.instanceOf(Map).isRequired,   // {id: {id, name, childIds}}
    rootPath: PropTypes.string.isRequired,
    rootId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    rootIcon: PropTypes.node,
    openIcon: PropTypes.node,
    closeIcon: PropTypes.node,
    onOpen: PropTypes.func,
    onSelect: PropTypes.func,
    onRoot: PropTypes.func
  }

  static defaultProps = {
    rootIcon: <div className="icon-folder"/>,
    openIcon: <div className="icon-triangle-down" style={{transform: 'rotate(-90deg)'}}/>,
    closeIcon: <div className="icon-triangle-down"/>
  }

  state = {
    order: 'alpha-asc',
    opened: new Set([this.props.rootId]),
    selected: new Set(),
    filter: ''
  }

  componentWillReceiveProps (nextProps) {
    const { rootId } = nextProps
    if (!this.state.opened.has(rootId)) this.open(rootId)
  }

  flatten (parent, depth, files, filter) {
    if (!parent) return
    const matches = (file, filter) => (
      !filter.length || file.name.toLowerCase().includes(filter) ||
      file.path.toLowerCase().includes(filter)
    )
    if (depth > 0 && (parent.childIds || matches(parent, filter))) files.push(parent)
    const { items } = this.props
    const { order, opened } = this.state
    if (!parent.childIds || !opened.has(parent.id)) return
    const sorter = this.sort(order)
    const kids = [...parent.childIds].map(id => ({...items.get(id), depth})).sort(sorter)
    kids.forEach(kid => { this.flatten(kid, depth + 1, files, filter) })
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
    const { items, rootId, onSelect } = this.props
    const { filter, selected } = this.state
    const files = []
    this.flatten(items.get(rootId), 0, files, filter.toLowerCase())
    const ids = selectId(id, event.shiftKey, event.metaKey, files, selected)
    this.setState({selected: ids})
    if (onSelect) onSelect(id, ids, items, event)
  }

  setRoot = (path) => {
    if (this.props.onRoot) this.props.onRoot(path)
  }

  changeFilter = (event) => {
    this.setState({filter: event.target.value})
  }

  clearFilter = (event) => {
    this.setState({filter: ''})
  }

  renderPads (depth) {
    if (depth <= 0) return null
    let pads = []
    for (let i = 0; i < depth; ++i) pads.push(<div key={i} className="Finder-pad"/>)
    return pads
  }

  render () {
    const { items, rootId, rootPath, rootIcon, openIcon, closeIcon } = this.props
    const { opened, selected, filter } = this.state
    const files = []
    this.flatten(items.get(rootId), 0, files, filter.toLowerCase())
    const dirs = rootPath.slice(1).split('/').filter(dir => dir.length > 0)
    return (
      <div className="Finder">
        <div className="Finder-header">
          <div className="Finder-filter">
            { rootIcon }
            <Filter className="box" value={filter} onChange={this.changeFilter}
                    onClear={this.clearFilter} placeholder="Filter files"/>
          </div>
        </div>
        <div className="Finder-files">
          { files.map(file => (
            <div key={file.id}
                 className={classnames('Finder-file', {selected: selected.has(file.id)})}>
              { this.renderPads(file.depth) }
              <div className="Finder-file-icon"
                   onClick={file.childIds && (e => this.open(file.id, e))}>
                { file.childIds && (opened.has(file.id) ? closeIcon : openIcon) }
              </div>
              <div className="Finder-file-name"
                   onDoubleClick={file.childIds && (e => this.setRoot(file.path))}
                   onClick={e => this.select(file.id, e)}>{file.name}</div>
            </div>
          ))}
        </div>
        <div className="Finder-root">
          <div key="/" className="flexRowCenter">
            <div onClick={e => this.setRoot('/')}
                 className="Finder-root-folder icon-folder" />
            <div className="Finder-root-dir">/</div>
          </div>
          { dirs.map((dir, i) => (
            <div key={dir} className="flexRowCenter">
              <div className="Finder-root-separator">&rsaquo;</div>
              <div onClick={e => this.setRoot('/' + dirs.slice(0, i + 1).join('/'))}
                   className="Finder-root-folder icon-folder" />
              <div className="Finder-root-dir">{dir}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}