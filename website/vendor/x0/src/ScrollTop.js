import React from 'react'
import { Location } from '@reach/Router'

const withLocation = Comp => props => (
  <Location>
    {({ location }) => <Comp location={location} {...props} />}
  </Location>
)

export default withLocation(class extends React.Component {
  componentDidUpdate (prev) {
    const { hash } = this.props.location

    if (prev.location !== this.props.location) {
      window.scrollTo(0, 0)
    }

    // check performance of this
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (!el) return
      el.scrollIntoView()
    }
  }

  render () {
    return false
  }
})
