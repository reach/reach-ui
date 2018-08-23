import React from 'react'

export default class Catch extends React.Component {
  state = {
    err: null
  }

  componentDidCatch (err) {
    this.setState({ err })
  }

  componentWillReceiveProps (next) {
    if (!this.state.err) return
    this.setState({ err: null })
  }

  render () {
    const { err } = this.state

    if (!err) return this.props.children

    return (
      <pre
        children={err.toString()}
        style={{
          color: 'white',
          backgroundColor: 'red',
          fontFamily: 'Menlo, monospace',
          fontSize: '14px',
          margin: 0,
          padding: '16px',
          minHeight: '128px',
          whiteSpace: 'prewrap'
        }}
      />
    )
  }
}
