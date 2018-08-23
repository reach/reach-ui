
# Routing

x0 automatically creates routes based on files in the root directory.
Any `.js`, `.md`, `.mdx`, or `.jsx` file will create a route based on the file name.

*Note that `.jsx` files are JSX format and **not** standard JavaScript*

Files that begin with an underscore (e.g. `_layout.js`) will be ignored.

To create a page with a React component, it must be the `default` export of a module.

```jsx
import React from 'react'

export default class extends React.Component {
  render () {
    return (
      <h1>Hello</h1>
    )
  }
}
```

## Index routes

Files with the `index` basename (e.g. `index.js` or `index.md`) will be used as an index page for the directory it's located in. Adding an `index.md` file at the root of the directory will make the page available at the `/` pathname in the URL.

## Nested routes

Adding files to subdirectories will create nested routes.
For example, adding a file at `api/core.md` will create a route at `/api/core` and a file at `api/index.md` will create a route for `/api/`.

## Links

x0 uses [React Router][react-router] under the hood.
In markdown, links will automatically use React Router's `<Link />` component for relative links.

To add links in a React component, import the `Link` component from `react-router-dom`

```jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default props =>
  <div>
    <Link to='/api'>API</Link>
  </div>
```

## 404 page

A custom 404 page can be added with a file named `404.md`, `404.js`, `404.mdx`, or `404.jsx`.
By default, x0 will show a link list of available routes for URLs that aren't valid routes.
When exporting with `x0 build` the 404 page will be written to `404.html`, which works with GitHub pages.

[react-router]: https://github.com/ReactTraining/react-router
