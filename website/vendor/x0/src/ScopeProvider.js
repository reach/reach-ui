import React from 'react'
import { MDXProvider } from '@mdx-js/tag'
import { ScopeProvider } from 'react-scope-provider'
import defaultScope from './scope'

export default props => {
  const scope = {
    ...defaultScope,
    ...props.scope
  }
  return (
    <ScopeProvider scope={scope}>
      <MDXProvider components={scope}>
        <React.Fragment>
          {props.children}
        </React.Fragment>
      </MDXProvider>
    </ScopeProvider>
  )
}
