import React from 'react'

const App = props => (
  <h1>Hello</h1>
)

App.getInitialProps = async () => {
  return { hello: 'hi' }
}

export default App
