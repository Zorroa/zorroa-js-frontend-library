import React, { PropTypes } from 'react'

const FileIcon = (props) => {
  const { ext } = props
  let color = '#888'
  // https://docs.google.com/spreadsheets/d/1QTVOmvf4ImUYR7JFVJCpkvWjKiJGTgpFBVcXz1aTLTA/edit#gid=0
  switch (ext.toUpperCase()) {
    case 'AAC': color = '#996633'; break
    case 'AI': color = '#FF6600'; break
    case 'AVI': color = '#00980D'; break
    case 'BMP': color = '#4040FF'; break
    case 'DOC': color = '#0099FF'; break
    case 'FLV': color = '#FF0000'; break
    case 'GIF': color = '#00980D'; break
    case 'INDD': color = '#FF3D8F'; break
    case 'JPG':
    case 'JPEG': color = '#7F7F0A'; break
    case 'MIDI': color = '#009999'; break
    case 'MOV': color = '#990066'; break
    case 'MP3': color = '#0099FF'; break
    case 'MP4': color = '#0066CC'; break
    case 'MPG': color = '#663399'; break
    case 'PDF': color = '#CC0000'; break
    case 'PNG': color = '#7F0100'; break
    case 'PPT': color = '#DD3E00'; break
    case 'PSD': color = '#29CCF8'; break
    case 'RAW': color = '#FFBF00'; break
    case 'RTF': color = '#7F0100'; break
    case 'SVG': color = '#990066'; break
    case 'TIF':
    case 'TIFF': color = '#E88808'; break
    case 'TXT': color = '#0066CC'; break
    case 'WAV': color = '#00980D'; break
    case 'XLS': color = '#00980D'; break
    case 'ZIP': color = '#7E7E7E'; break
  }

  return (
    <svg className="FileIcon"
         version="1.1"
         id="Layer_1"
         xmlns="http://www.w3.org/2000/svg"
         xmlnsXlink="http://www.w3.org/1999/xlink"
         x="0px"
         y="0px"
         viewBox="0 0 15 20"
         xmlSpace="preserve"
         style={{ color }}
    >
      <path className="FileIcon-path" d="M10,0H0v20h15V5L10,0z M10,5V0.9L14.1,5H10z"/>
      <text transform="matrix(1 0 0 1 1.7656 18.1638)" className="FileIcon-text">
        {ext.toUpperCase()}
      </text>
    </svg>
  )
}

FileIcon.propTypes = {
  ext: PropTypes.string.isRequired
}

export default FileIcon
