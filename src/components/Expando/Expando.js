import React, { Component, PropTypes } from 'react'
import classnames from 'classnames'

import Toggle from '../Toggle'
import Filter from '../Filter'

export default class Expando extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      id: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      info: PropTypes.string
    })),
    infoField: PropTypes.string,
    onSelect: PropTypes.func.isRequired
  }

  static defaultProps = {
    infoField: 'description'
  }

  state = {
    filter: '',
    showInfo: true,
    itemId: -1
  }

  selectItem (item, event) {
    const itemId = item.id
    this.setState({itemId})
    console.log('Select pipline ' + itemId + ' ' + item.name)
    this.props.onSelect(item, event)
  }

  changeFilter = (event) => {
    this.setState({filter: event.target.value})
  }

  clearFilter = (event) => {
    this.setState({filter: ''})
  }

  toggleInfo = () => {
    const showInfo = !this.state.showInfo
    this.setState({showInfo})
  }

  render () {
    const { items, infoField } = this.props
    const { itemId, filter, showInfo } = this.state
    const lcFilter = filter.toLowerCase()
    const filteredItems = items && items.filter(item => (
        item.name.toLowerCase().includes(lcFilter) ||
        item[infoField].toLowerCase().includes(lcFilter)
      ))
    return (
      <div className="Expando">
        <div className="Expando-header">
          <Filter value={filter} onChange={this.changeFilter}
                  onClear={filter ? this.clearFilter : null}
                  placeholder="Filter processor scripts" />
          <div className="Expando-item-script-info">
            <div className="Expando-item-script-info-label">
              Show Script Information
            </div>
            <Toggle checked={showInfo} onChange={this.toggleInfo} />
            <div onClick={this.toggleInfo}
                 className={classnames('Expando-item-script-info-state', {showInfo})}>
              {showInfo ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>
        <div className="Expando-body" >
          { filteredItems ? filteredItems.map(item => (
            <div key={item.id} className={classnames('Expando-item', {isSelected: item.id === itemId})}>
              <div onClick={!showInfo && ((e) => this.selectItem(item, e))}
                   className={classnames('Expando-item-header', {showInfo})}>
                <div className="Expando-item-title">
                  <div className="icon-script"/>
                  <div className="Expando-item-name">
                    {item.name}
                  </div>
                </div>
              </div>
              <div className={classnames('Expando-item-body', {showInfo})}>
                <div className="Expando-item-info">
                  {item[infoField]}
                </div>
                <div onClick={e => this.selectItem(item, e)}
                     className="Expando-item-select">
                  Select
                </div>
              </div>
            </div>
          )) : null }
        </div>
      </div>
    )
  }
}
