import React from 'react'
import { Html } from '@compositor/x0'
import { ServerStyleSheet } from 'styled-components'

// Used for styled-components rerendering
import App from './App'

const css = `*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0}`

const Root = props => {
  const sheet = new ServerStyleSheet()
  sheet.collectStyles(<App {...props} />)

  const styles = sheet.getStyleElement()

  return (
    <Html
      {...props}
      title='x0 styled-components'
      css={css}
      head={styles}
    />
  )
}

export default Root
