import React from 'react'
import { Link } from '@reach/router'

export default ({ routes = [] }) => (
  <React.Fragment>
    <pre>{DIRNAME}</pre>
    <ul>
      {routes.map(route => (
        <li key={route.key}>
          <Link to={route.path}>
            {route.name}
          </Link>
        </li>
      ))}
    </ul>
  </React.Fragment>
)
