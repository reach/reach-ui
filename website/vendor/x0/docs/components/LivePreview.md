
# LivePreview

The LivePreview component can be used in React components outside of markdown code fences.
When used within a [ScopeProvider](ScopeProvider) component, there's no need to pass a custom `scope` object.

```jsx
import React from 'react'
import { LivePreview } from '@compositor/x0/components'

const code = `<Button>Hello</Button>`

export default props =>
  <LivePreview
    code={code}
  />
```
