
# Using MDX

x0 also supports [MDX][mdx] format out of the box.
MDX allows you to mix markdown syntax with JSX to render React components.

```mdx
---
title: MDX Example
---
import { Box } from 'rebass'

# Hello

<Box p={3} bg='tomato'>
  Beep
</Box>
```

## MDX Live Editor

Code blocks declared as `.mdx` will render a live MDX editor.

```.mdx
# Hello, LiveEditor

<div style={{ padding: '20px', backgroundColor: 'tomato' }}>
  <h4>Beep</h4>
</div>
```

[mdx]: https://github.com/mdx-js/mdx
