---
title: Hello JSX
---
import { Box, Heading, Text, Link } from 'rebass'

<Box px={3} py={4}>
  <Heading is='h1' mb={2}>
    {props.title}
  </Heading>
  <Text>
    With <Link href='https://jxnblk.com/rebass'>Rebass</Link> in scope
  </Text>
</Box>
