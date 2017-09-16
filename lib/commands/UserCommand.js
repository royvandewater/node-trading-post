/* eslint-disable no-console */

const dashdash = require('dashdash')
const isEmpty = require('lodash/fp/isEmpty')
const packageJson = require('../../package.json')
const TradingPost = require('../../index')

const parser = dashdash.createParser({
  options: [{
    names: ['help', 'h'],
    type: 'bool',
    help: 'Print this help and exit.',
  }, {
    names: ['version', 'v'],
    type: 'bool',
    help: 'Print the current version and exit.',
  }],
})

class UserCommand {
  constructor({ baseUrl, argv, credentialsFile }) {
    if (isEmpty(baseUrl)) throw new Error('Missing required parameter: baseUrl')
    if (isEmpty(credentialsFile)) throw new Error('Missing required parameter: credentialsFile')
    this.options = parser.parse(argv)
    this.options.baseUrl = baseUrl
    this.options.credentialsFile = credentialsFile
  }

  run() {
    if (this.options.help) {
      console.log(this.usage()) // eslint-disable-line no-console
      process.exit(0)
    }

    if (this.options.version) {
      console.log(packageJson.version) // eslint-disable-line no-console
      process.exit(0)
    }

    const { baseUrl, credentialsFile } = this.options
    const tradingPost = new TradingPost({ baseUrl, credentialsFile })
    tradingPost.getUser((error, user) => {
      if (error) throw error
      console.log(JSON.stringify(user, null, 2))
      process.exit(0)
    })
  }

  usage() {
    return `
USAGE:
    ${packageJson.name} [GLOBALOPTS] user [OPTIONS]

OPTIONS:
${parser.help({ includeEnv: true, indent: 4 })}
    `.trim()
  }
}

module.exports = UserCommand
