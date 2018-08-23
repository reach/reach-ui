import React from 'react'
import {
  Container
} from 'rebass'

export default props => props.active
  ? <Container
      px={3}
      py={5}
      {...props}
    />
  : props.children
