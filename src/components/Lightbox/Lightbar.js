import React, { Component, PropTypes } from 'react'

export default class Lightbar extends Component {
  static displayName = 'Lightbar'

  static contextTypes = {
    router: PropTypes.object
  }

  closeLightbox () {
    this.context.router.push('/')
  }

  renderAttribute (label, value) {
    return (
      <div key={label} className="Lightbar-attr flexRowCenter">
        <div className="Lightbar-attr-label">{label}</div>
        <div className="Lightbar-attr-value">{value}</div>
      </div>
    )
  }

  render () {
    const attrs = { 'Character Name': 'Elephants', 'File Name': 'Dumbo-disneyscreencaps.com-907.jpg' }
    return (
      <div className="Lightbar flexRowCenter">
        <button className="Lightbar-settings icon-cog" />
        { Object.keys(attrs).map((key) => (this.renderAttribute(key, attrs[key])))}
        <div className="flexOn" />
        <button className='Lightbar-action flexRowCenter'>
          <span className='Lightbar-action-text'>Download</span>
          <i className='Lightbar-btn-icon icon-download2'/>
        </button>
        <button className='Lightbar-action flexRowCenter'>
          <span className='Lightbar-action-text'>Get Link</span>
          <i className='Lightbar-btn-icon icon-link2'/>
        </button>
        <button className='Lightbar-action flexRowCenter'>
          <span className='Lightbar-action-text'>Add to Collection</span>
          <i className='Lightbar-btn-icon icon-chevron-down'/>
        </button>
        <button className="Lightbar-close icon-cross2" onClick={this.closeLightbox.bind(this)} />
      </div>
    )
  }
}
