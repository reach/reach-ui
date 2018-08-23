import test from 'ava'
import template from '../lib/template'

test('template snapshot', t => {
  const html = template({
    title: 'Test',
    html: 'hello',
    css: '<style>body{color:tomato}</style>',
    scripts: '<script>console.log("beep")</script>',
    meta: [
      { name: 'twitter:card', content: 'summary' }
    ],
    links: [
      { rel: 'stylesheet', content: 'hello.css' }
    ]
  })
  t.snapshot(html)
})

test('template static snapshot', t => {
  const html = template({
    title: 'Test',
    html: 'hello',
    css: '<style>body{color:tomato}</style>',
    static: true,
    scripts: '<script>console.log("beep")</script>',
    meta: [
      { name: 'twitter:card', content: 'summary' }
    ],
    links: [
      { rel: 'stylesheet', content: 'hello.css' }
    ]
  })
  t.snapshot(html)
})
