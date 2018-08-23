import React from 'react'
import { Link } from '@reach/router'
import styled from 'styled-components'
import {
  style,
  gridGap,
  gridAutoRows,
  borderColor
} from 'styled-system'

const gridWidth = style({
  prop: 'width',
  cssProperty: 'gridTemplateColumns',
  getter: n => `repeat(auto-fit, minmax(${n}px, 1fr))`
})

const Grid = styled.div([], {
  display: 'grid'
},
  gridWidth,
  gridGap,
  gridAutoRows
)

Grid.defaultProps = {
  width: 256,
  gridAutoRows: 192
}

const Card = styled(Link)([], {
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  overflow: 'hidden',
  border: '1px solid'
}, borderColor)

Card.defaultProps = {
  borderColor: 'gray'
}

export default class extends React.Component {
  static defaultProps = {
    fullWidth: true,
    hidePagination: true
  }

  render () {
    const {
      routes = [],
      route,
      location
    } = this.props

    const examples = routes
      .filter(r => r.dirname === route.dirname)
      .filter(r => r !== route)

    return (
      <React.Fragment>
        <Grid>
          {examples.map(({
            key,
            path,
            name,
            Component
          }) => (
            <Card
              key={key}
              to={path}
            >
              <Component />
              <pre>{name}</pre>
            </Card>
          ))}
        </Grid>
      </React.Fragment>
    )
  }
}
