import React from 'react'
import X0 from './_logo'

export default ({
  size = 1024
}) =>
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 12'
    width={size}
    height={size / 2}
    fill='none'
    stroke='currentcolor'
  >
    <rect
      width={24}
      height={12}
      stroke='none'
      fill='black'
    />
    <g transform='translate(8, 2)'>
      <X0
        size={8}
        color='white'
      />
    </g>
  </svg>
