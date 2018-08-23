import React from 'react'
import { Location, Link } from '@reach/router'
import rebassMarkdown from '@rebass/markdown'
import { Pre } from 'rebass'
import { MDXTag } from '@mdx-js/tag'

import LiveEditor from './LiveEditor'
import LivePreview from './LivePreview'

const cleanHREF = href => href
  .replace(/\.mdx?$/, '')
  .replace(/\.jsx?$/, '')

const withLocation = (Comp) => props => (
  <Location>
    {({ location }) => <Comp location={location} {...props} />}
  </Location>
)

export const link = withLocation(({
  href = '',
  location,
  children,
  className,
  ...props
}) => {
  if (/^https?:\/\//.test(href) || /^#/.test(href)) {
    return (
      <a
        href={href}
        className={className}
        children={children}
      />
    )
  }
  const to = cleanHREF(href, location.pathname)
  return (
    <Link
      to={to}
      className={className}
      children={children}
    />
  )
})

export const code = ({
  children,
  className,
  scope,
  ...props
}) => {
  const lang = className.replace(/^language\-/, '')
  const type = lang.charAt(0)
  const code = React.Children.toArray(children).join('\n')

  switch (type) {
    case '.':
      return <LiveEditor code={code} scope={scope} mdx={lang.includes('.mdx')} />
    case '!':
      return <LivePreview code={code} scope={scope} />
    default:
      return (
        <Pre
          p={3}
          mt={4}
          mb={4}
          bg='gray'
          children={children}
        />
      )
  }
}

const pre = props => props.children

const scope = {
  MDXTag,
  components: {}, // does mdx need this?
  ...rebassMarkdown({
    a: {
      is: link
    },
    code: {
      is: code
    },
    pre: {
      is: pre,
    }
  })
}

export default scope
