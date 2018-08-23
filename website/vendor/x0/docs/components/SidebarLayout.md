
# SidebarLayout

The SidebarLayout component can be used to quickly create a documentation site with navigation.
This site uses the SidebarLayout component for navigation and pagination in the documentation section.

To use the component, import it in a [custom App](/custom-app).

```jsx
import React from 'react'
import { SidebarLayout } from '@compositor/x0/components'

export default props =>
  <SidebarLayout {...props} />
```

## Customizing navigation

The `props.routes` array can be altered to customize the order, names, and other aspects of the navigation.

### Sorting the routes

By default the `routes` array is in alphabetical order, with index pages occuring first.
To sort the array for display in navigation, pass a new `routes` prop to the SidebarLayout component.

```jsx
import React from 'react'
import { SidebarLayout } from '@compositor/x0/components'
import sortBy from 'lodash.sortby'

const navOrder = [
  'index',
  'getting-started',
  'api'
]

export default props => {
  const sortedRoutes = sortBy(props.routes, route => {
    const i = navOrder.indexOf(route.name)
    return i
  })

  return (
    <SidebarLayout
      {...props}
      routes={sortedRoutes}
    />
  )
}
```

### Customizing Route Names

By default the layout will format the filename by capitalizing each word and removing hyphens.
To customize the name of the routes for navigation, pass a new `routes` prop to the SidebarLayout component.

```jsx
import React from 'react'
import { SidebarLayout } from '@compositor/x0/components'
import sortBy from 'lodash.sortby'

const routeNames = {
  index: 'Home',
  api: 'API'
}

export default props => {
  const renamedRoutes = props.routes.map(route => {
    if (!routeNames[route.name]) return route
    return {
      ...route,
      name: routeNames[route.name]
    }
  })

  return (
    <SidebarLayout
      {...props}
      routes={renamedRoutes}
    />
  )
}
```

## Full Width Pages

The SidebarLayout component will center the contents of the page by default.
To make a page span the full width of the main column, set the `fullWidth` option in default props or front-matter.

```md
---
fullWidth: true
---

# Full-width markdown page
```

```jsx
import React from 'react'

export default class extends React.Component {
  static defaultProps = {
    fullWidth: true
  }

  render () {
    return (
      <h1>Full-width component</h1>
    )
  }
}
```

## Page-Specific Layouts

Custom layouts can be specified as front-matter or default props, then handled in a custom App component to control the layout for specific pages.

```jsx
// example with custom layouts
import React from 'react'
import { SidebarLayout } from '@compositor/x0/components'
import HomeLayout from './_home-layout.js'

export default props => {
  const { route } = this.props
  const { layout } = route.props

  const Layout = layout === 'home' ? HomeLayout : SidebarLayout

  return <Layout {...this.props} />
}
```


