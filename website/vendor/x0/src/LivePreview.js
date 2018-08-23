import React from 'react'
import {
  LiveProvider,
  LivePreview,
  LiveError
} from 'react-live'
import { ScopeConsumer } from 'react-scope-provider'
import { Box } from 'rebass'

const transformCode = str => `<React.Fragment>${str}</React.Fragment>`

export default ({
  code,
  scope
}) => (
  <Box mb={4}>
    <ScopeConsumer defaultScope={scope}>
      {scope => (
        <LiveProvider
          code={code}
          scope={scope}
          mountStylesheet={false}
          transformCode={transformCode}>
          <LivePreview />
          <LiveError />
        </LiveProvider>
      )}
    </ScopeConsumer>
  </Box>
)
