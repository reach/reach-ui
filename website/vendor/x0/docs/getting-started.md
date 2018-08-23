---
---

# Getting Started

Install x0 either globally or as a dev dependency in your project.

```sh
npm install --global @compositor/x0
```

```sh
npm install --save-dev @compositor/x0
```

Create a directory for your documentation or other site.

```sh
mkdir docs
```

Start the development server.

```sh
x0 docs
```

*Note: if you installed x0 as a dev dependency, add the command above to a run script in your `package.json`*


Create an `index.md` file in the `docs/` directory.

```md
# Hello World
```

Open your browser to <http://localhost:8080> to see the file you just created.

To create another route, add another file to the `docs/` directory,
for example `getting-started.md`

````md
# Getting Started

```sh
npm install @compositor/x0
```
````

The `getting-started.md` file should now be available at <http://localhost:8080/getting-started>.

Add a link to the *Getting Started* page from `index.md`.

```md
# Hello World

- [Getting Started](getting-started)
```

## Using React components

In addition to markdown, x0 can render any React component as a page.
Create a `demo.js` file.

```jsx
// demo.js
import React from 'react'

export default class extends React.Component {
  render () {
    return (
      <h1>Demo</h1>
    )
  }
}
```

## Using MDX

x0 also supports [MDX][mdx] format, which allows you to mix JSX with markdown syntax.

```md
import { Box } from 'rebass'

# Hello MDX

<Box p={3} bg='tomato'>
  This will render as a React component
</Box>
```

[mdx]: https://github.com/mdx-js/mdx
