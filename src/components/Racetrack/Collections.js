import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import classnames from 'classnames'

import TrashedFolder from '../../models/TrashedFolder'
import { CollectionsWidgetInfo } from './WidgetInfo'
import { selectFolderIds } from '../../actions/folderAction'
import { restoreFolders } from '../../actions/racetrackAction'
import Widget from './Widget'
import Suggestions from '../Suggestions'
import Folder from '../../models/Folder'
import AssetFilter from '../../models/AssetFilter'
import AssetSearch from '../../models/AssetSearch'

class Collections extends Component {
  static propTypes = {
    folders: PropTypes.instanceOf(Map),
    selectedFolderIds: PropTypes.object,
    trashedFolders: PropTypes.arrayOf(PropTypes.instanceOf(TrashedFolder)),
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
  }

  state = {
    folders: [],
    suggestions: [],
    suggestion: '',
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedFolderIds && nextProps.selectedFolderIds.size) {
      const folders = [...this.state.folders]
      nextProps.selectedFolderIds.forEach(id => {
        if (folders.findIndex(folder => folder.id === id) < 0) {
          const folder = nextProps.folders.get(id)
          if (folder) folders.push(folder)
        }
      })
      this.setState({ folders })
    }
  }

  toggleFolder = (folder, event) => {
    const selectedIds = new Set([...this.props.selectedFolderIds])
    if (selectedIds.has(folder.id)) {
      selectedIds.delete(folder.id)
    } else {
      selectedIds.add(folder.id)
    }
    this.props.actions.selectFolderIds(selectedIds)
    this.setState({ suggestions: [], suggestion: '' })
  }

  clearAll = event => {
    this.props.actions.selectFolderIds()
    this.setState({ suggestions: [], suggestion: '' })
  }

  suggest = (suggestion, lastAction) => {
    const { folders } = this.props
    console.log('Suggest ' + suggestion)
    let suggestions = []
    if (suggestion && suggestion.length && lastAction === 'type') {
      const key = suggestion.toLowerCase()
      const iter = folders.values()
      for (
        let i = iter.next();
        !i.done && suggestions.length < 5;
        i = iter.next()
      ) {
        const folder = i.value
        if (
          folder.name.toLowerCase().includes(key) &&
          this.state.folders.findIndex(f => f.id === folder.id) < 0
        )
          suggestions.push({ text: folder.name, folder: folder })
      }
      this.setState({ suggestions, suggestion })
    }
  }

  select = text => {
    if (!text) return
    const { suggestions } = this.state
    const suggestion = suggestions.find(suggestion => suggestion.text === text)
    const folder = suggestion && suggestion.folder
    const selectedFolderIds = new Set([
      ...this.props.selectedFolderIds,
      folder.id,
    ])
    this.props.actions.selectFolderIds(selectedFolderIds)
    console.log('Select ' + text)
    this.setState({ suggestions: [], suggestion: '' })
    console.log('Select suggestion ' + text)
  }

  restore = () => {
    const { folders, selectedFolderIds } = this.props
    const smartFolders = [...selectedFolderIds.values()]
      .map(id => folders.get(id))
      .filter(folder => folder && folder.isSmartCollection())
    const unrestoredFolderIds = [...selectedFolderIds.values()]
      .map(id => folders.get(id))
      .filter(folder => folder && !folder.isSmartCollection())
      .map(folder => folder.id)
    if (unrestoredFolderIds.length) {
      const links = { folder: unrestoredFolderIds }
      const filter = new AssetFilter({ links })
      const search = new AssetSearch({ filter })
      const attrs = { widgets: [] }
      const folder = new Folder({ search, attrs })
      smartFolders.push(folder)
    }
    this.props.actions.restoreFolders(smartFolders)
  }

  render() {
    const {
      folders,
      selectedFolderIds,
      id,
      floatBody,
      isOpen,
      onOpen,
      isIconified,
    } = this.props
    const { suggestions, suggestion } = this.state
    const selectedFolders = [...selectedFolderIds.values()]
      .map(id => folders.get(id))
      .filter(folder => folder)
    const selectedFolderNames = selectedFolders.map(folder => folder.name)
    const title = selectedFolderNames.length
      ? isOpen ? CollectionsWidgetInfo.title : undefined
      : CollectionsWidgetInfo.title
    const field = selectedFolderNames.length
      ? isOpen ? undefined : selectedFolderNames.join(',')
      : undefined
    const canRestore = [...selectedFolderIds.values()]
      .map(id => folders.get(id))
      .filter(folder => folder && folder.isSmartCollection(folder)).length
    return (
      <Widget
        className="Collections"
        id={id}
        isOpen={isOpen}
        onOpen={onOpen}
        floatBody={floatBody}
        title={title}
        field={field}
        backgroundColor={CollectionsWidgetInfo.color}
        isIconified={isIconified}
        icon={CollectionsWidgetInfo.icon}>
        <div className="Collections-body">
          <div className="Collections-suggestions">
            <Suggestions
              suggestions={suggestions}
              placeholder="Search Folders"
              className="clear"
              value={suggestion}
              onChange={this.suggest}
              onSelect={this.select}
            />
          </div>
          {selectedFolderNames.length > 0 && (
            <div className="Collections-clear-all" key="clear-all">
              <div className="Collections-clear-all-label">
                {`${selectedFolderNames.length} folders selected`}
              </div>
              <div
                className="Collections-clear-all-icon icon-cancel-circle"
                onClick={this.clearAll}
              />
            </div>
          )}
          {selectedFolderNames.length <= 0 && (
            <div className="Collections-clear-all" key="clear-all" />
          )}
          <div className="Collections-folders">
            {!this.state.folders.length && (
              <div className="Collections-empty">
                <div className="icon-emptybox" />No Folders Selected
              </div>
            )}
            {this.state.folders.map(folder => (
              <div className="Collections-folder" key={folder.id}>
                <div
                  className={`Collections-folder-selected icon-checkbox-${
                    selectedFolderIds.has(folder.id) ? 'checked' : 'empty'
                  }`}
                  onClick={e => this.toggleFolder(folder, e)}
                />
                <div
                  className={`Collections-folder-type ${
                    folder.isDyhi()
                      ? 'icon-foldercog'
                      : folder.search
                        ? 'icon-collections-smart'
                        : 'icon-collections-simple'
                  }`}
                />
                <div className="Collections-folder-name">{folder.name}</div>
              </div>
            ))}
          </div>
          <div
            className={classnames('Collections-restore', {
              disabled: !canRestore,
            })}
            onClick={this.restore}>
            Restore Widgets
          </div>
        </div>
      </Widget>
    )
  }
}

export default connect(
  state => ({
    folders: state.folders.all,
    selectedFolderIds: state.folders.selectedFolderIds,
    trashedFolders: state.folders.trashedFolders,
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        selectFolderIds,
        restoreFolders,
      },
      dispatch,
    ),
  }),
)(Collections)
