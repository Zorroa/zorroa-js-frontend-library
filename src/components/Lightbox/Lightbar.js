import React, { Component, PropTypes } from 'react'

export default class Lightbar extends Component {
  static get displayName () {
    return 'Lightbar'
  }

  static contextTypes = {
    router: PropTypes.object,
  }

  closeLightbox () {
    this.context.router.push('/')
  }

  renderAttribute (label, value) {
    return (
      <div key={label} className="lightbar-attr">
        <div className="lightbar-attr-label">{label}</div>
        <div className="lightbar-attr-value">{value}</div>
      </div>
    )
  }

  render () {
    const attrs = { 'Character Name': 'Elephants', 'File Name': 'Dumbo-disneyscreencaps.com-907.jpg' }
    return (
      <div className="lightbar">
        <button><span className="lightbar-settings">*</span></button>
        { Object.keys(attrs).map((key) => (this.renderAttribute(key, attrs[key])))}
        <div className="flexOn" />
        <button>DOWNLOAD</button>
        <button>GET LINK</button>
        <button>ADD TO COLLECTION</button>
        <button className="icon-cross2" onClick={this.closeLightbox.bind(this)} >X</button>
      </div>
    )
  }
}
