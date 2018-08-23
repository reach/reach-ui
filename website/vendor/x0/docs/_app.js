import React from 'react'
import * as scope from 'rebass'
import { Link } from '@reach/router'
import { ScopeProvider, SidebarLayout } from '../components'
import {
  Provider as RebassProvider,
  Flex,
  Box,
  Container,
} from 'rebass'
import sortBy from 'lodash.sortby'

import LandingLayout from './_layout'
import theme from './_theme'
import X0 from './_logo'

const navOrder = [
  'index',
  'getting-started',
  'markdown',
  'react',
  'MDX',
  'JSX',
  'routing',
  'custom-app',
  'components',
    'ScopeProvider',
    'SidebarLayout',
    'LivePreview',
    'LiveEditor',
  'cli-options',
  'exporting',
  'examples',
]
const pageNames = {
  index: 'Home',
  'cli-options': 'CLI Options'
}

const sortRoutes = routes => [
  ...sortBy([...routes], a => {
    const i = navOrder.indexOf(a.name)
    return i < 0 ? Infinity : i
  })
].map(route => {
  if (!pageNames[route.name]) return route
  return {
    ...route,
    name: pageNames[route.name]
  }
})

export default class App extends React.Component {
  static defaultProps = {
    title: 'x0'
  }

  render () {
    const {
      routes,
      route,
      children,
    } = this.props
    const { layout } = (route && route.props) || {}

    const Layout = layout === 'landing'
      ? LandingLayout
      : SidebarLayout

    const nav = sortRoutes(routes)

    return (
      <ScopeProvider scope={scope}>
        <RebassProvider theme={theme}>
          <Layout
            {...this.props}
            routes={nav}
            logo={<X0 size={24} color='magenta' />}
          />
        </RebassProvider>
      </ScopeProvider>
    )
  }
}
