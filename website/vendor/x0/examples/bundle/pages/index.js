import React from 'react'
import { connect } from 'refunk'

const dec = state => ({ count: state.count - 1 })
const inc = state => ({ count: state.count + 1 })

const App = connect(props => (
  <div>
    <h1>hi Hello {props.count}</h1>
    <button onClick={e => props.update(dec)}>
      -
    </button>
    <button onClick={e => props.update(inc)}>
      +
    </button>
  </div>
))

App.defaultProps = {
  count: 16
}

export default App
