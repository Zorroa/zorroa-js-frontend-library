import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as assert from 'assert'

import Finder from '../Finder'
import spin from './spin.svg'
import {
  listServerImportFiles,
  getServerRootPath,
} from '../../actions/authAction'
import { makeTimeoutPromise } from '../../services/jsUtil'

const ROOT_ID = 0

class ServerPathChooser extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    actions: PropTypes.object,
  }

  state = {
    items: new Map(),
    rootId: ROOT_ID,
    rootPath: null,
    cursor: '',
    loading: false,
  }

  componentWillMount() {
    // Set a timeout after which we suggest the user try later.
    // If the server recovers after this timeout,
    // the component will recover gracefully and display files.
    // To test this scenario, uncomment the makeDelayPromise() below,
    // and set the timeout value to be less than the delay value.
    makeTimeoutPromise(
      // Load the root path list, create items for each root directory
      this.props.actions
        .getServerRootPath()
        // .then(response => makeDelayPromise(2000, response)) // Uncomment this to test slow server response
        .then(response => {
          const dirs = response.currentValue.split(',')
          this.insertItems(ROOT_ID, '', dirs, [])
          this.setState({ rootPath: '/' })
        }),
      10000,
      'unavailable',
    ).catch(_ => this.setState({ rootPath: 'unavailable' }))
  }

  setStateProm = newState => {
    return new Promise(resolve => this.setState(newState, resolve))
  }

  loadFiles = (path, parentId) => {
    const { rootPath } = this.state
    assert.ok(rootPath)
    if (rootPath === 'unavailable') return

    this.setStateProm({ loading: true })
      .then(_ => this.props.actions.listServerImportFiles(path))
      .then(response => {
        assert.ok(response)
        this.insertItems(parentId, path, response.dirs, response.files)
        const cursor = response.cursor
        this.setState({ cursor, loading: false })
      })
      .catch(error => {
        console.log(error)
        this.setState({ items: new Map(), loading: false })
      })
  }

  insertItems = (parentId, path, dirs, files) => {
    const children = dirs.concat(files)
    const childIds = new Set()
    let { items } = this.state
    children.forEach(f => {
      const itemPath = path + (path.length ? '/' : '') + f
      const item = {
        id: itemPath,
        childIds: dirs.indexOf(f) >= 0 ? new Set() : undefined,
        name: f,
        path: itemPath,
        parentId,
        metadata: { path_lower: itemPath.toLowerCase() },
      }
      items.set(itemPath, item)
      childIds.add(itemPath)
    })
    const parent = items.get(parentId)
    const newParent = parent
      ? { ...parent }
      : { id: ROOT_ID, path: '/', name: '/' }
    newParent.childIds = childIds
    items.set(parentId, newParent)
    this.setState({ items })
  }

  loadDirectory = id => {
    const file = this.state.items.get(id)
    if (file && file.metadata && file.metadata.path_lower.length > 1) {
      this.loadFiles(file.metadata.path_lower, id)
    }
  }

  setRoot = id => {
    this.setState({ rootId: id })
    this.loadDirectory(id)
  }

  render() {
    const { items, loading, rootId, userAccount, rootPath } = this.state
    const title =
      (userAccount && userAccount.name
        ? userAccount.name.display_name + "'s"
        : 'Unknown') + ' Dropbox'
    const icon = loading ? (
      <img
        className="ServerPathChooser-icon"
        src={spin}
        alt="Loading Dropbox"
      />
    ) : (
      <div
        className="ServerPathChooser-icon icon-folder-subfolders"
        title={title}
      />
    )

    // Show something during slow server connections
    if (rootPath === null) {
      return (
        <div className="ServerPathChooser fullWidth flexRowCenter">
          Contacting Server...
        </div>
      )
    }

    // Display a failure message if the server connection goes down or returns errors
    if (rootPath === 'unavailable') {
      return (
        <div
          className="ServerPathChooser fullWidth flexRowCenter"
          style={{ padding: '20px' }}>
          The server is unavailable. Please try again later or contact support.
        </div>
      )
    }

    return (
      <div className="ServerPathChooser">
        <Finder
          items={items}
          rootId={rootId}
          loading={loading}
          onSelect={this.props.onSelect}
          rootIcon={icon}
          onRoot={this.setRoot}
          onOpen={this.loadDirectory}
        />
      </div>
    )
  }
}

export default connect(
  state => ({
    app: state.app,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        listServerImportFiles,
        getServerRootPath,
      },
      dispatch,
    ),
  }),
)(ServerPathChooser)
