import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Asset from '../../../models/Asset'
import AssetSearch from '../../../models/AssetSearch'

export default class AssetsZeroState extends PureComponent {
  static propTypes = {
    actions: PropTypes.shape({
      resetRacetrackWidgets: PropTypes.func.isRequired,
      selectFolderIds: PropTypes.func.isRequired,
      unorderAssets: PropTypes.func.isRequired,
      selectJobIds: PropTypes.func.isRequired,
      isolateParent: PropTypes.func.isRequired,
    }),
    assets: PropTypes.arrayOf(PropTypes.instanceOf(Asset)),
    query: PropTypes.instanceOf(AssetSearch),
  }

  hasAssets() {
    const assets = this.props.assets
    return Array.isArray(assets) && assets.length > 0
  }

  hasHydratedQuery() {
    const query = this.props.query
    return query && query.empty() === false
  }

  clearSearch = () => {
    this.props.actions.resetRacetrackWidgets()
    this.props.actions.selectFolderIds()
    this.props.actions.unorderAssets()
    this.props.actions.selectJobIds()
    this.props.actions.isolateParent()
  }

  render() {
    if (this.hasAssets()) {
      return null
    }

    return (
      <div className="AssetsZeroState">
        <div className="AssetsZeroState__icon icon-search" />
        {this.hasHydratedQuery() && (
          <div>
            <div>No results</div>
            <button
              className="AssetsZeroState__button"
              onClick={this.clearSearch}>
              Clear Search
            </button>
          </div>
        )}
      </div>
    )
  }
}
