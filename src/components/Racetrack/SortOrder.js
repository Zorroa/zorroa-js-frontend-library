import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Asset from '../../models/Asset'
import Widget from './Widget'
import Suggestions from '../Suggestions'
import { SortOrderWidgetInfo } from './WidgetInfo'
import { sortAssets, orderAssets } from '../../actions/assetsAction'
import { unCamelCase } from '../../services/jsUtil'

class SortOrder extends Component {
  static propTypes = {
    order: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string.isRequired,
        ascending: PropTypes.bool.isRequired
      })),
    fields: PropTypes.object,                         // state.assets.fields
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onOpen: PropTypes.func,
    floatBody: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    suggestions: [],
    suggestion: ''
  }

  title (order, last) {
    const field = unCamelCase(order.field)
    const title = last ? Asset.lastNamespace(field) : field
    return `${title} ${order.ascending ? '\u2191' : '\u2193'}`
  }

  clearSort = () => {
    this.props.actions.sortAssets()
    this.setState({ suggestions: [], suggestion: '' })
  }

  suggest = (suggestion, lastAction) => {
    const { fields } = this.props
    console.log('Suggest ' + suggestion)
    let suggestions = []
    if (suggestion && suggestion.length && lastAction === 'type') {
      const key = suggestion.toLowerCase()
      const iter = Object.values(fields)
      for (let i = 0; i < iter.length && suggestions.length < 5; ++i) {
        const fields = iter[i]
        for (let j = 0; j < fields.length && suggestions.length < 5; ++j) {
          const field = fields[j]
          if (field.toLowerCase().includes(key)) suggestions.push({text: field})
        }
      }
      this.setState({suggestions, suggestion})
    }
  }

  select = (field) => {
    if (!field) return
    this.props.actions.sortAssets(field, true)
    console.log('Select ' + field)
    this.setState({suggestions: [], suggestion: ''})
    console.log('Select suggestion ' + field)
  }

  toggle = (idx) => {
    // Deep copy to avoid changing shared object state.assets.order and state.assets.query.order
    const order = JSON.parse(JSON.stringify(this.props.order))
    order[idx].ascending = !order[idx].ascending
    this.props.actions.orderAssets(order)
  }

  render () {
    const { order, id, floatBody, isOpen, onOpen, isIconified } = this.props
    const { suggestions, suggestion } = this.state
    const active = order && order.length > 0
    const title = active ? this.title(order[0], true) : SortOrderWidgetInfo.title

    return (
      <Widget className='SortOrder'
              id={id}
              isOpen={isOpen}
              onOpen={onOpen}
              floatBody={floatBody}
              title={title}
              backgroundColor={SortOrderWidgetInfo.color}
              isIconified={isIconified}
              icon={SortOrderWidgetInfo.icon}>
        <div className="SortOrder-body">
          { !active && <div className="SortOrder-empty"><div className="icon-emptybox"/>No sort order</div> }
          <div className="SortOrder-orders">
            { active && <div key="title" className="SortOrder-title">Sort by:</div> }
            { active && order.map((i, j) => <div key={i.field} onClick={_ => this.toggle(j)} className="SortOrder-label">{this.title(i, false)}</div>) }
          </div>
          <div className="SortOrder-suggestions">
            <Suggestions suggestions={suggestions} placeholder="Search fields"
                         value={suggestion} onChange={this.suggest} onSelect={this.select}/>
          </div>
          { active && (
            <div className="SortOrder-clear-all">
              <div className="SortOrder-clear-all-label">
                Clear sort order
              </div>
              <div className="Collections-clear-all-icon icon-cancel-circle" onClick={this.clearSort}/>
            </div>
          )}
        </div>
      </Widget>
    )
  }
}

export default connect(state => ({
  order: state.assets.order,
  fields: state.assets.fields
}), dispatch => ({
  actions: bindActionCreators({
    sortAssets,
    orderAssets
  }, dispatch)
}))(SortOrder)
