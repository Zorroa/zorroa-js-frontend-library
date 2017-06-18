import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import TrashedFolder from '../../models/TrashedFolder'
import { CollectionsWidgetInfo } from './WidgetInfo'
import { selectFolderIds } from '../../actions/folderAction'
import Widget from './Widget'
import Suggestions from '../Suggestions'

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
    floatBody: PropTypes.bool.isRequired
  }

  state = {
    suggestions: [],
    suggestion: ''
  }

  closeFolder = (folder, event) => {
    const selectedIds = new Set([...this.props.selectedFolderIds])
    selectedIds.delete(folder.id)
    this.props.actions.selectFolderIds(selectedIds)
    this.setState({ suggestions: [], suggestion: '' })
  }

  clearAll = (event) => {
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
      for (let i = iter.next(); !i.done && suggestions.length < 5; i = iter.next()) {
        const folder = i.value
        if (folder.name.toLowerCase().includes(key)) suggestions.push({text: folder.name, folder: folder})
      }
      this.setState({suggestions, suggestion})
    }
  }

  select = (text) => {
    if (!text) return
    const { suggestions } = this.state
    const suggestion = suggestions.find(suggestion => suggestion.text === text)
    const folder = suggestion && suggestion.folder
    const selectedFolderIds = new Set([...this.props.selectedFolderIds, folder.id])
    this.props.actions.selectFolderIds(selectedFolderIds)
    console.log('Select ' + text)
    this.setState({suggestions: [], suggestion: ''})
    console.log('Select suggestion ' + text)
  }

  render () {
    const { folders, selectedFolderIds, id, floatBody, isOpen, onOpen, isIconified } = this.props
    const { suggestions, suggestion } = this.state
    const selectedFolders = [...selectedFolderIds.values()].map(id => folders.get(id))
    const selectedFolderNames = selectedFolders.map(folder => folder.name)
    const title = selectedFolderNames.length ? undefined : CollectionsWidgetInfo.title
    const field = selectedFolderNames.length ? selectedFolderNames.join(',') : undefined
    const placeholder = selectedFolders.size ? '' : 'Search folders'

    return (
      <Widget className='Collections'
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
          <div className="Collections-folders">
            { !selectedFolders.length && <div className="Collections-empty"><div className="icon-emptybox"/>No Folders Selected</div> }
            { selectedFolders.map(folder => (
              <div className="Collections-folder" key={folder.id}>
                <div className="Collections-folder-name">{folder.name}</div>
                <div className="Collections-folder-close icon-cross2" onClick={e => this.closeFolder(folder, e)}/>
              </div>
            ))}
          </div>
          <div className="Collections-suggestions">
            <Suggestions suggestions={suggestions} placeholder={placeholder}
                         value={suggestion} onChange={this.suggest} onSelect={this.select}/>
          </div>
          { selectedFolderNames.length > 0 && (
            <div className="Collections-clear-all" key="clear-all">
              <div className="Collections-clear-all-label">
                {`${selectedFolderNames.length} folders selected`}
              </div>
              <div className="Collections-clear-all-icon icon-cancel-circle" onClick={this.clearAll}/>
            </div>
          )}
        </div>
      </Widget>
    )
  }
}

export default connect(state => ({
  folders: state.folders.all,
  selectedFolderIds: state.folders.selectedFolderIds,
  trashedFolders: state.folders.trashedFolders
}), dispatch => ({
  actions: bindActionCreators({
    selectFolderIds
  }, dispatch)
}))(Collections)
