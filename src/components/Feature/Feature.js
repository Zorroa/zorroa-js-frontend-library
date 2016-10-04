import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class Feature extends Component {
  static propTypes () {
    return {
      assets: PropTypes.array
    }
  }

  renderAssets (assets) {
    if (!assets) {
      return (<div>No assets</div>)
    }
    return (
      <div>
        <ul className="list-group">
          { assets.map((asset) => (
            <li key={asset.id} className="list-group-item">{asset.id}</li>
          )) }
        </ul>
      </div>
    )
  }

  render () {
    return (
      <div>
        {this.renderAssets(this.props.assets)}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  assets: state.assets.all
})

export default connect(mapStateToProps)(Feature)
