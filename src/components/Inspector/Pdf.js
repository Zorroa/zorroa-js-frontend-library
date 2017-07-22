import React, { Component, PropTypes } from 'react'

import ProgressCircle from '../ProgressCircle'

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
    page: PropTypes.number
  }

  static defaultProps = { page: 1 }

  onDocumentError = (err) => {
    if (err.isCanceled && err.pdf) {
      err.pdf.destroy()
      this.setState({ error: 'PDF loading canceled' })
    } else {
      this.setState({ error: 'Error loading PDF: ' + err })
    }
  }

  state = {
    page: null,
    pdf: null,
    error: null,
    scale: 1,
    disableZoomOut: false
  }

  componentDidMount () {
    this.loadPDFDocument(this.props)
    this.queueRenderPage(this.state.pageNumber)
  }

  componentWillReceiveProps (newProps) {
    const { pdf } = this.state

    const newDocInit = newProps.documentInitParameters
    const docInit = this.props.documentInitParameters

    if (newDocInit && docInit && newDocInit.url !== docInit.url) {
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
      this.documentPromise = null
    }
  }

  onDocumentComplete = (pdf) => {
    this.setState({ pdf, pageNumber: this.props.page, error: null })
    this.queueRenderPage(this.props.page)
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
      .then(this.onDocumentComplete)
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
    const { canvas } = this
    if (!canvas) return
    const canvasContext = canvas.getContext('2d')
    let unscaledViewport = page.getViewport(1)
    const scale = this.state.scale * canvas.width / unscaledViewport.width
    let viewport = page.getViewport(scale)

    // Adjust the scale so the view exactly fits the parent body element
    const body = canvas.parentElement
    let { width, height } = viewport
    const aspect = width / height
    let disableZoomOut = false
    if (height < body.clientHeight) {
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

  render () {
    const { pageNumber, pdf, progress, error, scale, disableZoomOut } = this.state
    const svg = require('./loading-ring.svg')
    if (error) {
      return (<div className="Pdf"><div className="error">{error}</div></div>)
    }
    if (!pdf && !progress) {
      return (<div className="Pdf"><img className="loading" src={svg} /></div>)
    }
    if (progress && progress.loaded < progress.total) {
      const percentage = Math.round(100 * progress.loaded / progress.total)
      return (<div className="Pdf"><ProgressCircle percentage={percentage} /></div>)
    }

    const isPreviousDisabled = pageNumber <= 1
    const isNextDisabled = pageNumber >= pdf.numPages
    const isZoomInDisabled = scale > 32
    const isZoomOutDisabled = scale < 0.1 || disableZoomOut
    return (
      <div className="Pdf">
        <div className="Pdf-singlepage-body">
          <canvas ref={(c) => { this.canvas = c }} />
        </div>
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
