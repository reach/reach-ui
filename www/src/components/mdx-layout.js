import React from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import { MDXProvider } from '@mdx-js/tag'
import Component from '../../../packages/component-component/src'

const MyCodeComponent = ({ children, className }) =>
  className.split('-')[1][0] === '.' ? (
    <LiveProvider code={children} scope={{ Component }}>
      <LiveEditor />
      <LiveError />
      <LivePreview />
    </LiveProvider>
  ) : (
    children
  )

let Fart = () => <div>FART</div>

export default class MDXLayout extends React.Component {
  render() {
    return (
      <div style={{ padding: 20 }}>
        <MDXProvider components={{ code: Fart }}>
          <div>{this.props.children}</div>
        </MDXProvider>
      </div>
    )
  }
}
