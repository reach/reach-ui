
# Using React Components

In addition to markdown, x0 is optimized for rendering React components as pages.
This makes it work great as a highly customizable documentation generator,
or as a quick and minimal isolated development environment.

To use a React component as a page, ensure the component is the `default` export.

```jsx
import React from 'react'

export default class extends React.Component {
  render () {
    return <h1>Hello</h1>
  }
}
```

## Default Props

Default props on components work in a similar manner to front-matter,
allowing you to supply page-level metadata to the [HTML template](customizing).

```jsx
import React from 'react'

export default class extends React.Component {
  static defaultProps = {
    title: 'Hello'
  }

  render () {
    return <h1>Hello</h1>
  }
}
```

## Fetching Data

Use the async `getInitialProps` static method to fetch data for the component.

```jsx
import React from 'react'
import fetch from 'isomorphic-fetch'

const endpoint = 'http://example.com/api'

export default class extends React.Component {
  static getInitialProps = async () => {
    const data = await fetch(endpoint)
    return {
      data
    }
  }

  render () {
    const { data } = this.props

    return <pre>{JSON.stringify(data, null, 2)}</pre>
  }
}

```

## Local State

Just like any React component, a page can use React state.

```jsx
import React from 'react'

export default class extends React.Component {
  state = {
    count: 0
  }

  increment = () => this.setState(state => ({ count: state.count + 1 }))

  render () {
    return (
      <div>
        <samp>{count}</samp>
        <button
          onClick={e => {
            this.increment()
          }}>
          +
        </button>
      </div>
    )
  }
}
```

## Links

Import React Router's `Link` component to create links to other pages.

```jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default props =>
  <div>
    <Link to='/getting-started'>Getting Started</Link>
    <Link to='/api'>API</Link>
  </div>
```

