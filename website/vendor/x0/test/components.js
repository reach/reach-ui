import test from 'ava'
import React from 'react'
import { create as render } from 'react-test-renderer'
import { StaticRouter } from 'react-router-dom'
import sinon from 'sinon'
import browserEnv from 'browser-env'

import {
  Catch,
  CenteredLayout,
  FileList,
  Library,
  LiveEditor,
  LivePreview,
  ScopeProvider,
  ScrollTop,
  SidebarLayout,
  scope
} from '../src'

browserEnv()

global.DIRNAME = 'beep'

const renderJSON = el => render(el).toJSON()

test('CenteredLayout renders with active prop', t => {
  const json = renderJSON(
    <CenteredLayout active>
      Hello
    </CenteredLayout>
  )
  t.snapshot(json)
})

test('CenteredLayout does not render without active prop', t => {
  const json = renderJSON(
    <CenteredLayout>
      Hello
    </CenteredLayout>
  )
  t.is(json, 'Hello')
})

test('Catch renders', t => {
  const json = renderJSON(
    <Catch>Catch</Catch>
  )
  t.snapshot(json)
})

test('Catch renders error', t => {
  const Throws = props => {
    throw new Error('nope')
    return false
  }
  const json = renderJSON(
    <Catch>
      <Throws />
    </Catch>
  )
  t.is(json.type, 'pre')
  t.is(json.children[0], 'Error: nope')
  t.snapshot(json)
})

test('FileList renders', t => {
  const json = renderJSON(
    <StaticRouter location='/' context={{}}>
      <FileList
        routes={[
          {
            path: '/',
            key: '/',
            name: 'Home'
          }
        ]}
      />
    </StaticRouter>
  )
  t.snapshot(json)
})

// doesn't seem to render correctly with refs
test.skip('LiveEditor renders', t => {
  const json = renderJSON(
    <LiveEditor
      code='<h1>Hello</h1>'
    />
  )
  t.snapshot(json)
})

test('LivePreview renders', t => {
  const json = renderJSON(
    <LivePreview code='<h1>Hello</h1>' />
  )
  t.snapshot(json)
})

test('ScopeProvider renders', t => {
  const json = renderJSON(
    <ScopeProvider>
      Hello
    </ScopeProvider>
  )
  t.snapshot(json)
})

test('ScrollTop renders', t => {
  const json = renderJSON(
    <StaticRouter location='/' context={{}}>
      <ScrollTop />
    </StaticRouter>
  )
  t.is(json, null)
})

test('ScrollTop scrolls window on location change', t => {
  sinon.stub(window, 'scrollTo')
  const instance = render(
    <StaticRouter location='/' context={{}}>
      <ScrollTop />
    </StaticRouter>
  )
  instance.update(
    <StaticRouter location='/hello' context={{}}>
      <ScrollTop />
    </StaticRouter>
  )
  t.true(window.scrollTo.calledOnce)
  window.scrollTo.restore()
})

test('ScrollTop scrolls to hash', t => {
  const el = document.body.appendChild(
    document.createElement('div')
  )
  el.id = 'hello'
  el.scrollIntoView = sinon.spy()

  const instance = render(
    <StaticRouter location='/' context={{}}>
      <ScrollTop />
    </StaticRouter>
  )
  instance.update(
    <StaticRouter location='/#hello' context={{}}>
      <ScrollTop />
    </StaticRouter>
  )

  t.true(el.scrollIntoView.calledOnce)
})

test('ScrollTop does not scroll to hash when there is no element', t => {
  const el = document.body.appendChild(
    document.createElement('div')
  )
  el.scrollIntoView = sinon.spy()

  const instance = render(
    <StaticRouter location='/' context={{}}>
      <ScrollTop />
    </StaticRouter>
  )
  instance.update(
    <StaticRouter location='/#hello' context={{}}>
      <ScrollTop />
    </StaticRouter>
  )

  t.false(el.scrollIntoView.calledOnce)
})

test('Library renders', t => {
  const json = renderJSON(
    <StaticRouter location='/' context={{}}>
      <Library
        route={{ dirname: '/examples', path: '/examples' }}
        routes={[
          {
            dirname: '/examples',
            key: 'hello',
            path: '/examples/hello',
            name: 'hello',
            Component: () => <pre>Hello</pre>
          },
        ]}
      />
    </StaticRouter>
  )
  t.snapshot(json)
})

test('SidebarLayout renders', t => {
  const home = {
    key: '/',
    path: '/',
    name: 'index',
    props: {},
    Component: () => <h1>Home</h1>
  }
  const json = renderJSON(
    <StaticRouter location='/' context={{}}>
      <SidebarLayout
        children='Content'
        route={home}
        routes={[
          home,
          {
            key: '/about',
            path: '/about',
            name: 'about',
            Component: () => <h1>About</h1>
          }
        ]}
      />
    </StaticRouter>
  )
  t.snapshot(json)
})

const blacklist = {
  pre: true,
  MDXTag: true,
  components: true
}

Object.keys(scope)
  .filter(key => !blacklist[key])
  .forEach(key => {
    test(`scope.${key} renders`, t => {
      const Component = scope[key]
      const json = renderJSON(
        <StaticRouter context={{}}>
          <Component />
        </StaticRouter>
      )
      t.snapshot(json)
    })
  })

test('scope.pre renders children only', t => {
  const json = renderJSON(
    React.createElement(scope.pre, null, 'Hello')
  )
  t.is(json, 'Hello')
})

test('scope.a renders a plain link for absolute URLs', t => {
  const Link = scope.a
  const json = renderJSON(
    <StaticRouter context={{}}>
      <Link href='http://example.com'>Hello</Link>
    </StaticRouter>
  )
  t.is(json.props.href, 'http://example.com')
  t.snapshot(json)
})

