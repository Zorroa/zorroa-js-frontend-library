import React, { Component, PropTypes } from 'react'

import Progress from '../Progress'
import { makePromiseQueue } from '../../services/jsUtil'
import * as ComputeLayout from '../Assets/ComputeLayout.js'

// Orignal Code: https://github.com/mikecousins/react-pdf-js
// Core library is Pdf.js, which we now call directly.
// Updated to ES6+ and simplified by removing lots of
// optional properties and the associated extra code.
// Modified to exactly fit rendered canvas to parent element.

require('pdfjs-dist/build/pdf.combined')
require('pdfjs-dist/web/compatibility')

export default class Pdf extends Component {
  static propTypes = {
    documentInitParameters: PropTypes.shape({
      url: PropTypes.string
    }),
    page: PropTypes.number,
    thumbSize: PropTypes.number,
    multipage: PropTypes.bool
  }

  static defaultProps = { page: 1 }

  constructor (props) {
    super(props)

    this.state = {
      pageNumber: 1,
      pdf: null,
      error: null,
      scale: 1,
      disableZoomOut: false,
      multipage: this.props.multipage,
      positions: [],
      multipageScrollHeight: 0,
      multipageScrollWidth: 0
    }

    this.multipageScroll = null
    this.multipageUpdateInterval = null
    this.multipageLayoutTimer = null
    this.canvases = {}
  }

  componentDidMount () {
    this.loadPDFDocument(this.props)
    this.queueRenderPage(this.state.pageNumber)
  }

  componentWillReceiveProps (newProps) {
    const { pdf } = this.state

    const newDocInit = newProps.documentInitParameters
    const docInit = this.props.documentInitParameters

    if ((newDocInit && newDocInit !== docInit) ||
      (newDocInit && docInit && newDocInit.url !== docInit.url)) {
      this.loadPDFDocument(newProps)
    }

    if (pdf && (newProps.page && newProps.page !== this.props.page)) {
      this.setState({ pageNumber: newProps.page, error: null })
      this.queueRenderPage(newProps.page)
    }
  }

  componentWillUnmount () {
    const { pdf } = this.state
    if (pdf) {
      pdf.destroy()
    }
    if (this.documentPromise) {
      this.documentPromise.cancel()
    }
  }

  onDocumentLoaded = (pdf) => {
    this.setState({ pdf, pageNumber: this.props.page, error: null })
    this.queueRenderPage(this.props.page)
  }

  onDocumentError = (err) => {
    if (err.isCanceled && err.pdf) {
      err.pdf.destroy()
      this.setState({ error: 'PDF loading canceled' })
    } else {
      this.setState({ error: 'Error loading PDF: ' + err })
    }
  }

  loadProgress = (progress) => {
    const pageNumber = this.state.pageNumber || 1
    if (progress && progress.loaded >= progress.total) {
      this.queueRenderPage(pageNumber)
      this.setState({ pageNumber, progress: null, error: null })
    } else {
      this.setState({ progress })
    }
  }

  getDocument = (val) => {
    if (this.documentPromise) {
      this.documentPromise.cancel()
    }
    this.documentPromise = makeCancelable(window.PDFJS.getDocument(val, null, null, this.loadProgress).promise)
    this.documentPromise.promise
      .then(this.onDocumentLoaded)
      .catch(this.onDocumentError)
    return this.documentPromise
  }

  loadPDFDocument (props) {
    if (props.documentInitParameters) {
      return this.getDocument(props.documentInitParameters)
    } else {
      throw new Error('Requires initial parameters')
    }
  }

  previousPage = () => {
    const pageNumber = Math.max(this.state.pageNumber - 1, 1)
    this.setState({ pageNumber })
    this.queueRenderPage(pageNumber)
  }

  nextPage = () => {
    const { pdf } = this.state
    const pageNumber = Math.min(this.state.pageNumber + 1, pdf.numPages)
    this.setState({ pageNumber })
    this.queueRenderPage(this.state.pageNumber + 1)
  }

  static scaleFactor = 1.5
  zoomIn = (event) => {
    const scale = this.state.scale * Pdf.scaleFactor
    this.setState({scale})
    this.queueRenderPage(this.state.pageNumber)
  }

  zoomOut = (event) => {
    const scale = this.state.scale / Pdf.scaleFactor
    this.setState({scale})
    this.queueRenderPage(this.state.pageNumber)
  }

  setMultipage = (multipage) => {
    this.setState({multipage}, () => {
      this.queueRenderPage(this.state.pageNumber)
    })
  }

  // https://mozilla.github.io/pdf.js/examples/
  pageNumPending = null
  pageRendering = false

  queueRenderPage = (pageNum) => {
    const { pdf } = this.state
    if (!pdf) return
    if (pageNum < 1 || pageNum > pdf.numPages) return

    if (this.pageRendering) {
      this.pageNumPending = pageNum
    } else {
      this._renderPage(pageNum)
    }
  }

  // dont call this directly; use queueRenderPage
  _renderPage = (pageNum) => {
    const { pdf } = this.state
    if (!pdf) return
    if (pageNum < 1 || pageNum > pdf.numPages) return

    this.pageRendering = true
    return pdf.getPage(pageNum)
    .then(page => this._UnsafeRenderPdf(page))
    .then(() => {
      this.pageRendering = false
      if (this.pageNumPending !== null) {
        this._renderPage(this.pageNumPending)
        this.pageNumPending = null
      }
    })
  }

  // dont call this directly; use queueRenderPage
  _UnsafeRenderPdf = (page) => {
    const { multipage } = this.state
    const canvasIndex = multipage ? page.pageNumber : 1
    const canvas = this.canvases[canvasIndex]
    if (!canvas) return
    const canvasContext = canvas.getContext('2d')
    const desiredWidth = (this.state.multipage) ? this.props.thumbSize : (this.multipageScrollWidth || 1200)
    let unscaledViewport = page.getViewport(1)
    const scale = this.state.scale * desiredWidth / unscaledViewport.width
    let viewport = page.getViewport(scale)

    // Adjust the scale so the view exactly fits the parent body element
    const body = canvas.parentElement
    let { width, height } = viewport
    const aspect = width / height
    let disableZoomOut = false
    if (!multipage && height < body.clientHeight) {
      disableZoomOut = true
      height = body.clientHeight
      width = height * aspect
      viewport = page.getViewport(scale * width / viewport.width)
    }
    canvas.height = viewport.height
    canvas.width = viewport.width

    // https://github.com/mozilla/pdf.js/issues/2923#issuecomment-14715851
    this.setState({error: null, disableZoomOut})
    return page.render({ canvasContext, viewport })
  }

  updateMultipageElement = (element) => {
    this.multipageScroll = element
    if (element) {
      if (this.multipageUpdateInterval) clearInterval(this.multipageUpdateInterval)
      this.multipageUpdateInterval = setInterval(this.multipageUpdate, 150)
    } else {
      clearInterval(this.multipageUpdateInterval)
      this.multipageUpdateInterval = null
      this.clearMultipageLayoutTimer()
    }
  }

  multipageUpdate = () => {
    const scroll = this.multipageScroll
    if (!scroll) return

    if (scroll.clientHeight !== this.state.multipageScrollHeight ||
      scroll.clientWidth !== this.state.multipageScrollWidth) {
      this.setState({
        multipageScrollHeight: scroll.clientHeight,
        multipageScrollWidth: scroll.clientWidth
      })
      this.queueMultipageLayout()
    }
  }

  runMultipageLayout = () => {
    const width = this.state.multipageScrollWidth // - 2 * multipageScrollPadding
    const { pdf } = this.state
    const { thumbSize } = this.props
    if (!width || !thumbSize || !pdf) return

    const pageNums = []
    for (let i = 1; i <= pdf.numPages; i++) {
      pageNums.push(i)
    }
    Promise.all(pageNums.map(pageNum => pdf.getPage(pageNum)))
    .then(pages => {
      const viewports = pages.map(page => page.getViewport(1))
      var { positions } = ComputeLayout.masonry(viewports, width, thumbSize)
      this.setState({ positions })
      this.clearMultipageLayoutTimer()
    })

    // // map asset ids to thumb index, so later we can easily track which thumbs
    // // belong to selected asset ids.
    // this.positionIndexByAssetId = {}
    // for (let i = 0; i < viewports.length; i++) {
    //   this.positionIndexByAssetId[viewports[i].id] = i
    // }
  }

  queueMultipageLayout = () => {
    this.clearMultipageLayoutTimer()
    this.multipageLayoutTimer = setTimeout(this.runMultipageLayout, 150)
  }

  clearMultipageLayoutTimer = () => {
    if (this.multipageLayoutTimer) clearTimeout(this.multipageLayoutTimer)
    this.multipageLayoutTimer = null
  }

  renderingMultipage = false
  renderPdfElement = () => {
    const { pdf, multipage } = this.state
    if (!multipage) {
      return (
        <div className="Pdf-singlepage-body">
          <canvas ref={(c) => { this.canvases[1] = c }} />
        </div>)
    }

    const { positions } = this.state
    let maxy = 0
    if (!positions.length) {
      this.queueMultipageLayout()
    } else {
      var pageElements = []
      var pageNumbers = []
      const lastPos = this.state.positions[this.state.positions.length - 1]
      maxy = lastPos.y + lastPos.height
      for (let i = 1; i <= pdf.numPages; i++) {
        const { x, y, width, height } = positions[i - 1]
        pageElements.push(<canvas key={`${i}`} ref={ (c) => { this.canvases[i] = c } }
          style={{top: `${y}px`, left: `${x}px`, width: `${width}px`, height: `${height}px`}}/>)
        pageNumbers.push(i)
      }

      if (!this.renderingMultipage) {
        this.renderingMultipage = true
        makePromiseQueue(pageNumbers, i => this._renderPage(i), 4)
        .then(() => {
          this.renderingMultipage = false
        })
      }
    }

    return (
      <div className="Pdf-multipage-scroll" ref={this.updateMultipageElement}>
        <div className="Pdf-multipage-body" style={{width: `100%`, height: `${maxy}px`}}>
          {pageElements}
        </div>
      </div>)
  }

  render () {
    const { pageNumber, pdf, progress, error, disableZoomOut, multipage } = this.state
    const svg = require('./loading-ring.svg')
    if (error) {
      return (<div className="Pdf"><div className="error">{error}</div></div>)
    }
    if (!pdf && !progress) {
      return (<div className="Pdf"><img className="loading" src={svg} /></div>)
    }
    if (progress && progress.loaded < progress.total) {
      const percentage = Math.round(100 * progress.loaded / progress.total)
      return (<div className="Pdf"><Progress percentage={percentage} /></div>)
    }
    let scale = (multipage) ? 1 : this.state.scale
    const isPreviousDisabled = multipage || (pageNumber <= 1)
    const isNextDisabled = multipage || (pageNumber >= pdf.numPages)
    const isZoomInDisabled = multipage || (scale > 32)
    const isZoomOutDisabled = multipage || (scale < 0.1) || disableZoomOut
    return (
      <div className="Pdf">
        { this.renderPdfElement() }
        { pdf && pdf.numPages && (
          <div className="Pdf-controls">
            <div className="Pdf-controls-group border-right">Page {pageNumber} / {pdf.numPages}</div>
            <div className="Pdf-controls-group">
              <button className="icon-frame-back" disabled={isPreviousDisabled}
                      onClick={this.previousPage}/>
              <button className="icon-frame-forward" disabled={isNextDisabled}
                      onClick={this.nextPage}/>
            </div>
            <div className="Pdf-controls-group">
              <button className="icon-zoom-in" disabled={isZoomInDisabled}
                      onClick={this.zoomIn}/>
              <button className="icon-zoom-out" disabled={isZoomOutDisabled}
                      onClick={this.zoomOut}/>
            </div>
            <div className="Pdf-controls-group">
              <button className="icon-checkbox-empty" disabled={!multipage}
                      onClick={this.setMultipage.bind(this, false)}/>
              <button className="icon-icons2" disabled={multipage}
                      onClick={this.setMultipage.bind(this, true)}/>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const makeCancelable = (promise) => {
  let hasCanceled = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(val => (
      hasCanceled ? reject({ pdf: val, isCanceled: true }) : resolve(val)
    ))
    promise.catch(error => (
      hasCanceled ? reject({ isCanceled: true }) : reject(error)
    ))
  })

  return {
    promise: wrappedPromise,
    cancel () {
      hasCanceled = true
    }
  }
}
