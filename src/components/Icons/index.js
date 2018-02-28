import React from 'react'

export function CancelCircle () {
  return (
    <svg
      width="15"
      height="15"
      xmlns="http://www.w3.org/2000/svg"
      xlinkHref="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path d="M7.5 0a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zm3.75 9.844L9.844 11.25 7.5 8.906 5.156 11.25 3.75 9.844 6.094 7.5 3.75 5.156 5.156 3.75 7.5 6.094 9.844 3.75l1.406 1.406L8.906 7.5l2.344 2.344z" id="a"/>
      </defs>
      <g fill="none" fillRule="evenodd">
        <mask id="b" fill="#fff">
          <use xlinkHref="#a"/>
        </mask>
        <use fill="#000" fillRule="nonzero" xlinkHref="#a"/>
        <g mask="url(#b)" fill="#CE2D3F">
          <path d="M0 0h15v15H0z"/>
        </g>
      </g>
    </svg>
  )
}

export function Save () {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xlinkHref="http://www.w3.org/1999/xlink" width="15" height="15">
      <defs>
        <path id="a" d="M12.3 0H2C.9 0 0 .8 0 1.9V13c0 1 .8 1.9 1.9 1.9H13c1 0 1.9-.8 1.9-1.9V3L12.3 0zm-1 5.6c0 .5-.5 1-1 1H4.7a1 1 0 0 1-1-1V1h7.5v4.7zm-1-3.7H8.4v3.7h2V2z"/>
      </defs>
      <g fill="none" fillRule="evenodd">
        <mask id="b" fill="#fff">
          <use xlinkHref="#a"/>
        </mask>
        <use fill="#000" fillRule="nonzero" xlinkHref="#a"/>
        <g fill="#fff" mask="url(#b)">
          <path d="M0 0h15v15H0z"/>
        </g>
      </g>
    </svg>
  )
}
