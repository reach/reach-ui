import fs from 'fs'
import path from 'path'
import test from 'ava'
import rimraf from 'rimraf'
import build from '../lib/build'

const input = path.resolve('test/components')
const output = path.resolve('test/output')
const htmlFile = path.resolve('test/output/index.html')
const propsFile = path.resolve('test/output/props/index.html')
const bundleFile = path.resolve('test/output/bundle.js')

const options = {
  input,
  dirname: input,
  outDir: output,
}

const clean = () => {
  if (fs.existsSync(output)) {
    rimraf.sync(output)
  }
}

test.before(clean)
test.after(clean)

test('static renders', async t => {
  const res = await build(options)
  const html = fs.readFileSync(htmlFile, 'utf8')
  t.snapshot(html)
})
