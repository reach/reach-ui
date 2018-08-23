import React from 'react'
import { Link } from '@reach/router'

export default class extends React.Component {
  static getInitialProps = async () => {
    return {
      asyncProps: 'hello'
    }
  }

  render () {
    const {
      count,
      update
    } = this.props

    return (
      <div>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
        <h1>Hello x0</h1>
        <samp>{count}</samp>
        <button onClick={e => update(dec)}>-</button>
        <button onClick={e => update(inc)}>+</button>
      </div>
    )
  }
}

const dec = s => ({ count: s.count - 1 })
const inc = s => ({ count: s.count + 1 })
