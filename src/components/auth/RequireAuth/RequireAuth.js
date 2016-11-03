import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

export default function (ComposedComponent, url = '/') {
  class Authentication extends Component {
    static get contextTypes () {
      return {
        router: PropTypes.object
      }
    }

    static propTypes = {
      authenticated: PropTypes.bool
    }

    componentWillMount () {
      if (!this.props.authenticated) {
        this.context.router.push(url)
      }
    }

    componentWillUpdate (nextProps) {
      if (!nextProps.authenticated) {
        this.context.router.push(url)
      }
    }

    render () {
      if (!this.props.authenticated) {
        return <div/>
      }
      return <ComposedComponent {...this.props} />
    }
  }

  function mapStateToProps (state) {
    return { authenticated: state.auth.authenticated }
  }

  return connect(mapStateToProps)(Authentication)
}
