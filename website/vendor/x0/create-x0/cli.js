#!/usr/bin/env node
const path = require('path')
const init = require('initit')
const chalk = require('chalk')

const [ name ] = process.argv.slice(2)
const template = 'c8r/x0/examples/basic'

if (!name) {
  console.log('name is required: $ create-x0 my-project')
  process.exit(1)
}

console.log('Creating x0 project ', chalk.green(name))
console.log()

init({
  name,
  template,
})
  .then(res => {
    console.log(
      chalk.green(
        'Successfully created new x0 project'
      )
    )
    process.exit(0)
  })
  .catch(err => {
    console.log(
      chalk.red(err)
    )
    process.exit(1)
  })
