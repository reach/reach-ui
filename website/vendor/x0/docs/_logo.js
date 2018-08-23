import React from 'react'

export default ({
  size = 128,
  color = 'currentcolor'
}) =>
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='-12 -12 24 24'
    width={size}
    height={size}
    fill='none'
    stroke={color}
  >
    <circle
      strokeWidth={2}
      opacity={4/4}
      r={11}
    />
    <circle
      strokeWidth={1/4}
      r={11.75}
      opacity={0/4}
    />
    <g opacity={4/4} strokeWidth={2}>
      <path d='M-5 -5 L5 5' />
      <path d='M-5 5 L5 -5' />
    </g>
  </svg>
