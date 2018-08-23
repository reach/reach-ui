import React from 'react'
import { Logo } from '@compositor/logo'
import { Box, Text, Heading } from 'rebass'

export default props =>
  <Box
    px={4}
    pt={0}
    pb={7}
    color='white'
    bg='black'>
    <Logo
      horizontal
      size={256}
      color='cyan'
      backgroundColor='black'
    />
    <Heading
      is='h1'
      px={4}
      ml={2}
      fontSize={7}>
      <Text is='span' color='cyan'>Hello</Text> x0
    </Heading>
  </Box>
