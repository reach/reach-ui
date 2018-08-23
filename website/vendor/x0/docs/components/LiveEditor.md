
# LiveEditor

The LiveEditor component can be used in React components outside of markdown code fences.
When used within a [ScopeProvider](ScopeProvider) component, there's no need to pass a custom `scope` object.

```jsx
import React from 'react'
import { LiveEditor } from '@compositor/x0/components'

const code = `<Button>Hello</Button>`

export default props =>
  <LiveEditor
    code={code}
  />
```
