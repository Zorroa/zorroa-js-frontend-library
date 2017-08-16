import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as assert from 'assert'

import Finder from '../Finder'
import spin from './spin.svg'
import { listServerImportFiles } from '../../actions/authAction'

const ROOT_ID = 0
const ROOT_PATH = '/Volumes'

class ServerPathChooser extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    actions: PropTypes.object
  }

  state = {
    items: new Map(),
    rootId: ROOT_ID,
    cursor: '',
    loading: false
  }

  componentWillMount () {
    this.loadFiles(ROOT_PATH, this.state.rootId)
  }

  loadFiles = (path, parentId) => {
    if (path === '/') path = ''

    this.setState({loading: true})

    this.props.actions.listServerImportFiles(path)
    .then((response) => {
      assert.ok(response.data)
      const dirs = response.data.dirs
      const files = response.data.files
      const children = dirs.concat(files)
      const childIds = new Set()
      let { items } = this.state
      children.forEach(f => {
        const itemPath = path + '/' + f
        const item = {
          id: itemPath,
          childIds: (dirs.indexOf(f) >= 0) ? new Set() : undefined,
          name: f,
          path: itemPath,
          parentId,
          metadata: { path_lower: itemPath.toLowerCase() }
        }
        items.set(itemPath, item)
        childIds.add(itemPath)
      })
      const parent = items.get(parentId)
      const newParent = parent ? { ...parent } : { id: ROOT_ID, path: ROOT_PATH, name: '/' }
      newParent.childIds = childIds
      items.set(parentId, newParent)
      const cursor = response.cursor
      this.setState({items, cursor, loading: false})
    })
    .catch((error) => {
      console.log(error)
      this.setState({items: new Map(), loading: false})
    })
  }

  loadDirectory = (id) => {
    const file = this.state.items.get(id)
    if (file && file.metadata && file.metadata.path_lower.length > 1) {
      this.loadFiles(file.metadata.path_lower, id)
    }
  }

  setRoot = (id) => {
    this.setState({rootId: id})
    this.loadDirectory(id)
  }

  render () {
    const { items, loading, rootId, userAccount } = this.state
    const title = (userAccount && userAccount.name ? userAccount.name.display_name + '\'s' : 'Unknown') + ' Dropbox'
    const icon = loading ? <img className="ServerPathChooser-icon" src={spin} alt="Loading Dropbox"/> : <div className="ServerPathChooser-icon icon-folder-subfolders" title={title}/>
    return (
      <div className="ServerPathChooser">
        <Finder items={items} rootId={rootId} loading={loading}
                onSelect={this.props.onSelect}
                rootIcon={icon}
                onRoot={this.setRoot}
                onOpen={this.loadDirectory} />
      </div>
    )
  }
}

export default connect(state => ({
  app: state.app
}), dispatch => ({
  actions: bindActionCreators({
    listServerImportFiles
  }, dispatch)
}))(ServerPathChooser)
