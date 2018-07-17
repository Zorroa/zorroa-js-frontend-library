import React, { Component, PropTypes } from 'react'
import './File.scss'

export default class File extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    readAs: PropTypes.oneOf(['text']),
    accept: PropTypes.string,
  }

  static defaultProps = {
    readAs: 'text',
  }

  state = {
    hasError: false,
    files: [],
  }

  read(fileList) {
    if (fileList instanceof FileList === false) {
      return Promise.reject(
        'Cannot read files, a FileList object must be passed',
      )
    }
    const files = new Array(...fileList)
    return Promise.all(
      files.map(file => {
        const reader = new FileReader(file)

        return new Promise((resolve, reject) => {
          reader.onerror = reject
          reader.onloadend = resolve
          reader.readAsText(file)
        })
          .then(event => {
            const { name, size, type } = file
            return {
              content: event.target.result,
              name,
              size,
              type,
            }
          })
          .catch(error => {
            return Promise.reject(error)
          })
      }),
    )
  }

  onChange = event => {
    event.persist()
    const files = event.target.files
    this.setState({
      hasError: false,
    })
    this.read(files).then(
      readFiles => {
        this.setState(
          {
            files: readFiles,
          },
          () => {
            this.props.onChange(this.state.files)
          },
        )
      },
      () => {
        this.setState({
          hasError: true,
        })
      },
    )
  }

  getName() {
    return this.state.files
      .map(file => {
        return file.name
      })
      .join(', ')
  }

  render() {
    return (
      <div className="File">
        <div className="File__preview">
          <span className="File__name">{this.getName()}</span>
          <div className="File__button">Upload</div>
        </div>
        <input
          className="File__input"
          type="file"
          accept={this.props.accept}
          onChange={this.onChange}
        />
      </div>
    )
  }
}
