import React from 'react'
import {
  Flex,
  Box,
  Container,
  Text,
  Caps,
  BlockLink,
} from 'rebass'
import { Link } from '@reach/router'
import { Logo } from '@compositor/logo'

export default ({ children }) =>
  <React.Fragment>
    <Flex alignItems='center'>
      <BlockLink
        href='https://compositor.io'>
        <Flex px={1} py={2} alignItems='center'>
          <Logo size={32} />
          <Caps fontWeight='bold'>
            Compositor
          </Caps>
        </Flex>
      </BlockLink>
      <Box mx='auto' />
      <BlockLink px={3} is={Link} to='/'>
        <Caps fontWeight='bold'>
          x0
        </Caps>
      </BlockLink>
      <BlockLink px={3} href='https://github.com/c8r/x0'>
        <Caps fontWeight='bold'>
          GitHub
        </Caps>
      </BlockLink>
    </Flex>
    {children}
    <Container>
      <Flex py={4} mt={5} flexWrap='wrap'>
        <BlockLink my={2} mr={3} href='https://github.com/c8r/x0'>
          <Caps fontWeight='bold'>
            GitHub
          </Caps>
        </BlockLink>
        <BlockLink my={2} mr={3} href='https://compositor.io'>
          <Caps fontWeight='bold'>
            Compositor
          </Caps>
        </BlockLink>
        <Box mx='auto' />
        <Text my={2} fontSize={0}>
          © 2018 Compositor, Inc. All rights reserved
        </Text>
      </Flex>
    </Container>
  </React.Fragment>
