import React, { Component, PropTypes } from 'react'

import Progress from '../Progress'

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
    scale: PropTypes.number
  }

  static defaultProps = { page: 1, scale: 1.0 }

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
    rendering: false,
    error: null
  }

  componentDidMount () {
    this.loadPDFDocument(this.props)
    this.renderPdf()
  }

  componentWillReceiveProps (newProps) {
    const { pdf } = this.state

    const newDocInit = newProps.documentInitParameters
    const docInit = this.props.documentInitParameters

    if ((newDocInit && newDocInit !== docInit) ||
      (newDocInit && docInit && newDocInit.url !== docInit.url)) {
      this.loadPDFDocument(newProps)
    }

    if (pdf && ((newProps.page && newProps.page !== this.props.page) ||
      (newProps.scale && newProps.scale !== this.props.scale))) {
      this.setState({ page: null, error: null })
      pdf.getPage(newProps.page).then(this.onPageComplete)
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

  onDocumentComplete = (pdf) => {
    this.setState({ pdf, error: null })
    pdf.getPage(this.props.page).then(this.onPageComplete)
  }

  onPageComplete = (page) => {
    this.setState({ page, error: null })
    this.renderPdf()
  }

  loadProgress = (progress) => {
    if (progress && progress.loaded >= progress.total) {
      this.renderPdf()
      this.setState({ progress: null, error: null })
    } else {
      this.setState({ progress })
    }
  }

  getDocument = (val) => {
    if (this.documentPromise) {
      this.documentPromise.cancel()
    }
    this.documentPromise = makeCancelable(window.PDFJS.getDocument(val, null, null, this.loadProgress).promise)
    this.documentPromise
      .promise
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
    const { page, pdf, rendering } = this.state
    if (rendering) return
    if (page && page.pageIndex) {
      pdf.getPage(page.pageIndex).then(this.onPageComplete)
    }
  }

  nextPage = () => {
    const { page, pdf, rendering } = this.state
    if (rendering) return
    if (pdf && page && page.pageIndex < pdf.numPages - 1) {
      pdf.getPage(page.pageIndex + 2).then(this.onPageComplete)
    }
  }

  scroll = (event) => {
    if (event.deltaY > 1) {
      this.nextPage()
    } else if (event.deltaY < 1) {
      this.previousPage()
    }
  }

  renderPdf () {
    const { page } = this.state
    if (page) {
      const { canvas } = this
      if (!canvas) return
      const canvasContext = canvas.getContext('2d')
      const { scale } = this.props
      let viewport = page.getViewport(scale)

      // Adjust the scale so the view exactly fits the parent body element
      const body = canvas.parentElement
      let { width, height } = viewport
      const aspect = width / height
      if (width > body.clientWidth) {
        width = body.clientWidth
        height = width / aspect
      }
      if (height > body.clientHeight) {
        height = body.clientHeight
        width = height * aspect
      }
      if (width === viewport.width) {
        if (body.clientWidth - width > body.clientHeight - height) {
          height = body.clientHeight
          width = height * aspect
        } else {
          width = body.clientWidth
          height = width / aspect
        }
      }
      if (width !== viewport.width) {
        viewport = page.getViewport(scale * width / viewport.width)
      }
      canvas.height = viewport.height
      canvas.width = viewport.width

      // https://github.com/mozilla/pdf.js/issues/2923#issuecomment-14715851
      this.setState({rendering: true, error: null})
      page.render({ canvasContext, viewport })
      .then(() => { this.setState({rendering: false}) })
    }
  }

  render () {
    const { page, pdf, progress, error } = this.state
    const svg = require('./loading-ring.svg')
    if (error) {
      return (<div className="Pdf"><div className="error">{error}</div></div>)
    }
    if (!page && !progress) {
      return (<div className="Pdf"><img className="loading" src={svg} /></div>)
    }
    if (progress && progress.loaded < progress.total) {
      const percentage = Math.round(100 * progress.loaded / progress.total)
      return (<div className="Pdf"><Progress percentage={percentage} /></div>)
    }
    const isPreviousDisabled = page.pageIndex < 1
    const isNextDisabled = page.pageIndex >= pdf.numPages - 1
    return (
      <div className="Pdf">
        <div className="body" onWheel={this.scroll}>
          <canvas ref={(c) => { this.canvas = c }} />
        </div>
        { pdf && pdf.numPages && (
          <div className="controls">
            <div>Page {page.pageIndex + 1} / {pdf.numPages}</div>
            <button disabled={isPreviousDisabled} onClick={this.previousPage}>Previous Page</button>
            <button disabled={isNextDisabled} onClick={this.nextPage}>Next Page</button>
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
