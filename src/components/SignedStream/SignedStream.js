import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Asset from '../../models/Asset'
import {
  LOAD_STATE_PENDING,
  LOAD_STATE_SUCCESS,
  LOAD_STATE_ERROR,
} from '../../constants/general.js'
import api from '../../api'
import getDisplayName from '../../services/componentDisplayName'

function wrapSignedStream(WrappedComponent) {
  const displayName = getDisplayName(WrappedComponent, 'SignedStreamHOC')
  class SignedStream extends PureComponent {
    static propTypes = {
      asset: PropTypes.instanceOf(Asset).isRequired,
      origin: PropTypes.string.isRequired,
    }
    static displayName = displayName

    constructor(props) {
      super(props)

      this.state = {
        loadState: LOAD_STATE_PENDING,
        signedAssetUrl: props.asset.url(props.origin),
      }
    }

    componentDidMount() {
      this.fetchSignedUrl()
    }

    componentDidUpdate(prevProps) {
      if (prevProps.asset !== this.props.asset) {
        this.fetchSignedUrl()
      }
    }

    fetchSignedUrlSuccess = response => {
      const asset = this.props.asset
      const defaultAssetUrl = asset.url(this.props.origin)
      if (response.signedUrl) {
        this.setState({
          signedAssetUrl: response.signedUrl,
          loadState: LOAD_STATE_SUCCESS,
        })
        return
      }

      this.setState({
        signedAssetUrl: defaultAssetUrl,
        loadState: LOAD_STATE_SUCCESS,
      })
    }

    fetchSignedUrlError = errorResponse => {
      console.error(errorResponse)
      this.setState({
        loadState: LOAD_STATE_ERROR,
      })
    }

    fetchSignedUrl() {
      const asset = this.props.asset
      const assetId = asset.id
      this.setState({
        loadState: LOAD_STATE_PENDING,
      })

      api
        .stream()
        .head({ id: assetId })
        .then(this.fetchSignedUrlSuccess)
        .catch(this.fetchSignedUrlError)
    }

    render() {
      if (this.state.loadState === LOAD_STATE_PENDING) {
        return null
      }

      if (this.state.loadState === LOAD_STATE_ERROR) {
        return <div>Unable to retrieve a signed URL.</div>
      }

      return <WrappedComponent {...this.props} {...this.state} />
    }
  }

  return SignedStream
}

export default wrapSignedStream
