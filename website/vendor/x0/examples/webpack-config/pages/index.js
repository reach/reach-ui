import React from 'react'
import readme from '../README.md'

const App = props => (
  <div>
    <h1>Hello markdown-loader</h1>
    <div
      dangerouslySetInnerHTML={{
        __html: readme
      }}
    />
  </div>
)

export default App
