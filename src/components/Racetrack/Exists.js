import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import WidgetModel from '../../models/Widget'
import Asset from '../../models/Asset'
import AssetSearch from '../../models/AssetSearch'
import AssetFilter from '../../models/AssetFilter'
import { ExistsWidgetInfo } from './WidgetInfo'
import { modifyRacetrackWidget, removeRacetrackWidgetIds } from '../../actions/racetrackAction'
import { showModal } from '../../actions/appActions'
import Widget from './Widget'
import Toggle from '../Toggle'
import DisplayOptions from '../DisplayOptions'
import { unCamelCase } from '../../services/jsUtil'

class Exists extends Component {
  static propTypes = {
    query: PropTypes.instanceOf(AssetSearch).isRequired,
    actions: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    isIconified: PropTypes.bool.isRequired,
    widgets: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    field: '',
    isMissing: false
  }

  // If the query is changed elsewhere, e.g. from the Searchbar,
  // capture the new props and update our local state to match.
  syncWithAppState (nextProps, selectFieldIfEmpty) {
    const { id, widgets } = nextProps
    const index = widgets && widgets.findIndex(widget => (id === widget.id))
    const widget = widgets && widgets[index]
    if (widget && widget.sliver && widget.sliver.filter) {
      const isMissing = !!widget.sliver.filter.missing
      const field = (isMissing) ? widget.sliver.filter.missing[0] : widget.sliver.filter.exists[0]
      this.setState({ field, isMissing })
    } else {
      if (selectFieldIfEmpty) {
        this.selectField()
      } else {
        this.removeFilter()
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    this.syncWithAppState(nextProps)
  }

  componentWillMount () {
    this.syncWithAppState(this.props, true)
  }

  // Remove our sliver if the close button in our header is clicked
  removeFilter = () => {
    this.props.actions.removeRacetrackWidgetIds([this.props.id])
  }

  modifySliver = (field, isMissing) => {
    const type = ExistsWidgetInfo.type
    const sliver = new AssetSearch()
    if (field) {
      const key = (isMissing) ? 'missing' : 'exists'
      sliver.filter = new AssetFilter({ [key]: [ field ] })
    }
    const widget = new WidgetModel({ id: this.props.id, type, sliver })
    this.props.actions.modifyRacetrackWidget(widget)
  }

  selectField = (event) => {
    const width = '75%'
    const body = <DisplayOptions title='Search Field'
                                 syncLabel={null}
                                 singleSelection={true}
                                 fieldTypes={null}
                                 selectedFields={[]}
                                 onUpdate={this.updateDisplayOptions}/>
    this.props.actions.showModal({body, width})
    event && event.stopPropagation()
  }

  updateDisplayOptions = (event, state) => {
    const field = state.checkedNamespaces && state.checkedNamespaces.length && state.checkedNamespaces[0]
    if (field && field.length) {
      this.setState({ field })
      this.modifySliver(field, this.state.isMissing)
    }
  }

  toggleMissing = (event) => {
    const isMissing = !event.target.checked
    this.setState({ isMissing })
    this.modifySliver(this.state.field, isMissing)
  }

  render () {
    const { isIconified } = this.props
    const { field } = this.state
    const title = Asset.lastNamespace(unCamelCase(field))
    return (
      <Widget className='Exists'
              header={(
                <div className="Exists-header">
                  <div className="Exists-header-label">
                    <span className="Exists-header-title">{ExistsWidgetInfo.title}{field.length ? ':' : ''}</span>
                    <span className="Exists-header-field">{title}</span>
                  </div>
                  <div onClick={this.selectField} className="Exists-settings icon-cog"/>
                </div>
              )}
              backgroundColor={ExistsWidgetInfo.color}
              isIconified={isIconified}
              icon={ExistsWidgetInfo.icon}
              onClose={this.removeFilter.bind(this)}>
        <div className="Exists-body">
          <div className="Exists-exists">
            <div className="Exists-missing-label">missing</div>
            <Toggle checked={!this.state.isMissing} onChange={this.toggleMissing} />
            <div className="Exists-exists-label">exists</div>
          </div>
        </div>
      </Widget>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ modifyRacetrackWidget, removeRacetrackWidgetIds, showModal }, dispatch)
})

const mapStateToProps = state => ({
  query: state.assets.query,
  widgets: state.racetrack && state.racetrack.widgets
})

export default connect(
  mapStateToProps, mapDispatchToProps
)(Exists)
