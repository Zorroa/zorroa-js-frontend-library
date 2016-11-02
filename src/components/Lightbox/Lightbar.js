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

        <button className='flexRowCenter'>Download<i className='lightbar-btn-icon icon-download2'/></button>
        <button className='flexRowCenter'>Get Link<i className='lightbar-btn-icon icon-link2'/></button>
        <button className='flexRowCenter'>Add to Collection<i className='lightbar-btn-icon icon-chevron-down'/></button>

        <button className="icon-cross2" style={{fontSize:'20px',marginLeft:'2em'}} onClick={this.closeLightbox.bind(this)} />
      </div>
    )
  }
}
