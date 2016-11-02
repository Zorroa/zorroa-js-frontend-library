import React, { Component, PropTypes } from 'react'

export default class Lightbar extends Component {
  static get displayName () {
    return 'Lightbar'
  }

  static get contextTypes () {
    return {
      router: PropTypes.object
    }
  }

  closeLightbox () {
    this.context.router.push('/')
  }

  renderAttribute (label, value) {
    return (
      <div key={label} className="lightbar-attr flexRowCenter">
        <div className="lightbar-attr-label">{label}</div>
        <div className="lightbar-attr-value">{value}</div>
      </div>
    )
  }

  render () {
    const attrs = { 'Character Name': 'Elephants', 'File Name': 'Dumbo-disneyscreencaps.com-907.jpg' }
    return (
      <div className="lightbar flexRowCenter">
        <button className="lightbar-settings icon-cog" />
        { Object.keys(attrs).map((key) => (this.renderAttribute(key, attrs[key])))}
        <div className="flexOn" />
        <button className='lightbar-action flexRowCenter'>
          <span className='lightbar-action-text'>Download</span>
          <i className='lightbar-btn-icon icon-download2'/>
        </button>
        <button className='lightbar-action flexRowCenter'>
          <span className='lightbar-action-text'>Get Link</span>
          <i className='lightbar-btn-icon icon-link2'/>
        </button>
        <button className='lightbar-action flexRowCenter'>
          <span className='lightbar-action-text'>Add to Collection</span>
          <i className='lightbar-btn-icon icon-chevron-down'/>
        </button>
        <button className="lightbar-close icon-cross2" onClick={this.closeLightbox.bind(this)} />
      </div>
    )
  }
}
