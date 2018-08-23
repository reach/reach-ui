import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Root = styled('div')({
  padding: '48px'
})

export default ({ render }) => (
  <Root>
    <nav>
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>
    </nav>
    {render()}
  </Root>
)
