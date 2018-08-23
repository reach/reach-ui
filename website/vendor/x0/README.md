
# x0

Document & develop React components without breaking a sweat

[![Build Status][build-badge]][build]

```sh
npm install -g @compositor/x0
```

[build-badge]: https://img.shields.io/travis/c8r/x0/master.svg?style=flat-square
[build]: https://travis-ci.org/c8r/x0

<img src='docs/hello-x0.gif' class='demo-image' />

## Features

- Zero-config
- No plugins
- Components over configuration
- Use markdown, MDX, or React components
- Automatic file system based routing
- Completely customizable
- Export static sites
- Works as an isolated development environment

Read more about x0 in our [blog post](https://compositor.io/blog/x0-making-react-component-development-stupid-simple/).

## Getting Started

x0 renders a directory of React components, automatically handling routing based on filename.
Create a `docs` folder and add an `index.js` file.

```jsx
// index.js
import React from 'react'

export default class extends React.Component {
  render () {
    return (
      <h1>Hello</h1>
    )
  }
}
```

Start a development server by running:

```sh
x0 docs --open
```

To add more pages, add a new component for each route. For example, create an about page:

```jsx
// about.js
import React from 'react'

export default props =>
  <h1>About</h1>
```

The about page should now render when navigating to  <http://localhost:8080/about>.

## Isolated development environment

```sh
x0 docs
```

Options:

```
-o --open       Open dev server in default browser
-p --port       Custom port for dev server
-t --template   Path to custom HTML template
--webpack       Path to custom webpack configuration
```

```sh
x0 docs -op 8080
```


## Static Build

Export static HTML and client-side bundle

```sh
x0 build docs
```

Export static HTML without bundle

```sh
x0 build docs --static
```

Options

```
-d --out-dir    Output directory (default dist)
-s --static     Output static HTML without JS bundle
-t --template   Path to custom HTML template
--webpack       Path to custom webpack configuration
```


## Fetching Data

Use the async `getInitialProps` static method to fetch data for static rendering.
This method was inspired by [Next.js][nextjs].

```jsx
const Index = props => (
  <h1>Hello {props.data}</h1>
)

Index.getInitialProps = async () => {
  const fetch = require('isomorphic-fetch')
  const res = await fetch('http://example.com/data')
  const data = await res.json()

  return { data }
}
```

## Custom App

A custom `App` component can be provided by including an `_app.js` file.
The `App` component uses the [render props][render-props] pattern to provide additional state and props to its child routes.

[render-props]: https://reactjs.org/docs/render-props.html

```jsx
// example _app.js
import React from 'react'

export default class extends React.Component {
  state = {
    count: 0
  }

  update = fn => this.setState(fn)

  render () {
    const { render, routes } = this.props

    return render({
      ...this.state,
      decrement: () => this.update(s => ({ count: s.count - 1 })),
      increment: () => this.update(s => ({ count: s.count + 1 }))
    })
  }
}
```

### Layouts

The `App` component can also be used to provide a common layout for all routes.

```jsx
// example _app.js
import React from 'react'
import Nav from '../components/Nav'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default class extends React.Component {
  render () {
    const {
      location,
      render,
      routes
    } = this.props

    const route = routes.find(route => route.path === location.pathname)

    return (
      <React.Fragment>
        <Nav />
        <Header
          route={route}
        />
        {render()}
        <Footer />
      </React.Fragment>
    )
  }
}
```

## CSS-in-JS

x0 supports server-side rendering for [styled-components][sc] and [emotion][emotion] with zero configuration.

### Styled Components

To enable CSS rendering for static export, ensure that `styled-components` is installed as a dependency in your `package.json`

```json
"dependencies": {
  "styled-components": "^3.2.6"
}
```

### Emotion

Ensure `emotion` is installed as a dependency in your `package.json`

```json
"dependencies": {
  "emotion": "^9.1.3"
}
```

## Configuration

Default options can be set in the `x0` field in `package.json`.

```json
"x0": {
  "static": true,
  "outDir": "site",
  "title": "Hello",
}
```

## Head content

Head elements such as `<title>`, `<meta>`, and `<style>` can be configured with the `x0` field in `package.json`.

```json
"x0": {
  "title": "My Site",
  "meta": [
    { "name": "twitter:card", "content": "summary" }
    { "name": "twitter:image", "content": "kitten.png" }
  ],
  "links": [
    {
      "rel": "stylesheet",
      "href": "https://fonts.googleapis.com/css?family=Roboto"
    }
  ]
}
```

## Custom HTML Template

A custom HTML template can be passed as the `template` option.

```json
"x0": {
  "template": "./html.js"
}
```

```js
// example template
module.exports = ({
  html,
  css,
  scripts,
  title,
  meta = [],
  links = [],
  static: isStatic
}) => `<!DOCTYPE html>
<head>
  <title>{title}</title>
  ${css}
</head>
<div id=root>${html}</div>
${scripts}
`
```

### Routing

x0 creates routes based on the file system, using [react-router][react-router].
To set the base URL for static builds, use the `basename` option.

```json
"x0": {
  "basename": "/my-site"
}
```

#### Links

To link between different components, install `react-router-dom` and use the `Link` component.

```sh
npm i react-router-dom
```

```js
import React from 'react'
import { Link } from 'react-router-dom'

export default () => (
  <div>
    <h1>Home</h1>
    <nav>
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>
    </nav>
  </div>
)
```

### JSX Format

x0 includes support for the Compositor JSX file format.

```jsx
---
title: Hello
---
import { Box, Heading } from 'rebass'

<Box px={2} py={4}>
  <Heading>
    {frontMatter.title}
  </Heading>
</Box>
```

### MDX Format

x0 includes support for the [MDX][mdx] file format.

```mdx
import { Box } from 'rebass'

# Hello MDX

<Box p={4} bg='tomato'>
  Beep Boop
</Box>
```

### webpack

Webpack configuration files named `webpack.config.js` will automatically be merged with the built-in configuration, using [webpack-merge][webpack-merge].
To use a custom filename, pass the file path to the `--webpack` flag.

```js
// webpack.config.js example
module.exports = {
  module: {
    rules: [
      { test: /\.txt$/, loader: 'raw-loader' }
    ]
  }
}
```

See the [example](https://github.com/c8r/x0/tree/master/examples/webpack-config).

#### Related

- [Compositor JSX][jsx-loader]
- [MDX][mdx]
- [React Router][react-router]
- [Mini HTML Webpack Plugin][mini-html]
- [Styled Components][sc]
- [Emotion][emotion]
- [webpack][webpack]
- [Create React App](https://github.com/facebookincubator/create-react-app)
- [Next.js][nextjs]
- [Gatsby][gatsby]
- [React-Static][react-static]

---

[Made by Compositor](https://compositor.io/)
|
[MIT License](LICENSE.md)

[jsx-loader]: https://github.com/c8r/jsx-loader
[mdx]: https://github.com/mdx-js/mdx
[nextjs]: https://github.com/zeit/next.js
[react-router]: https://github.com/ReactTraining/react-router
[mini-html]: https://github.com/styleguidist/mini-html-webpack-plugin
[sc]: https://github.com/styled-components/styled-components
[emotion]: https://github.com/emotion-js/emotion
[glamorous]: https://github.com/paypal/glamorous
[glamor]: https://github.com/threepointone/glamor
[gatsby]: https://github.com/gatsbyjs/gatsby
[react-static]: https://github.com/nozzle/react-static
[react-loadable]: https://github.com/thejameskyle/react-loadable
[webpack-merge]: https://github.com/survivejs/webpack-merge
[webpack]: https://webpack.js.org

