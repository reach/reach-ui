import React from 'react'
import {
  LiveProvider,
  LivePreview,
  LiveEditor,
  LiveError
} from 'react-live'
import { ScopeConsumer } from 'react-scope-provider'
import { Box } from 'rebass'
import { color, borderColor } from 'styled-system'
import styled from 'styled-components'
import mdx from '@mdx-js/mdx'

const transformCode = src => `<React.Fragment>${src}</React.Fragment>`
const transformMdx = src => {
  const code = mdx.sync(src)
  return code.replace(/^(\s)*export default \({components}\) =>/, '')
}

const Preview = styled(LivePreview)([], {
  padding: '16px',
  border: '1px solid',
  borderRadius: '2px 2px 0 0',
}, borderColor)
Preview.defaultProps = {
  borderColor: 'gray'
}

const Editor = styled(LiveEditor)([], {
  fontFamily: 'Menlo, monospace',
  fontSize: '13px',
  margin: 0,
  padding: '16px',
  overflow: 'auto',
  borderRadius: '0 0 2px 2px',
  '&:focus': {
    outline: 'none',
    boxShadow: 'inset 0 0 0 1px #6cf',
  }
}, color)
Editor.defaultProps = {
  bg: 'gray'
}

const Err = styled(LiveError)([], {
  fontFamily: 'Menlo, monospace',
  fontSize: '13px',
  padding: '8px',
  color: 'white',
  backgroundColor: 'red'
})

export default ({
  code,
  scope = {},
  render,
  mdx
}) => (
  <Box mb={4}>
    <ScopeConsumer defaultScope={scope}>
      {scope => (
        <LiveProvider
          code={code}
          scope={scope}
          mountStylesheet={false}
          transformCode={mdx ? transformMdx : transformCode}>
          {typeof render === 'function' ? (
            render({ code, scope })
          ) : (
            <React.Fragment>
              <Preview />
              <Editor />
              <Err />
            </React.Fragment>
          )}
        </LiveProvider>
      )}
    </ScopeConsumer>
  </Box>
)
