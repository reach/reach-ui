
# ScopeProvider

The ScopeProvider component allows you to customize the components that are used to render markdown elements
and to provide components in scope for rendering code fences as live previews.
It's best to use this component in a [Custom App](/custom-app) component.

```jsx
import React from 'react'
import ScopeProvider from '@compositor/x0/components'
import * as scope from '../src'

export default props =>
  <ScopeProvider scope={scope}>
    {props.children}
  </ScopeProvider>
```
