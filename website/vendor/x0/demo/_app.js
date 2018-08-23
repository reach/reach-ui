import React from 'react'

export default class App extends React.Component {
  state = {
    count: 32,
  }

  update = fn => this.setState(fn)

  render () {
    const { render, routes } = this.props

    return render({
      ...this.state,
      update: this.update
    })
  }
}
