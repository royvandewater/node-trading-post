/* eslint-disable no-console */

const chalk = require('chalk')
const dashdash = require('dashdash')
const camelCase = require('lodash/fp/camelCase')
const first = require('lodash/fp/first')
const isEmpty = require('lodash/fp/isEmpty')
const mapKeys = require('lodash/fp/mapKeys')
const packageJson = require('../../package.json')
const TradingPost = require('../../index')

const parser = dashdash.createParser({
  options: [{
    names: ['help', 'h'],
    type: 'bool',
    help: 'Print this help and exit.',
  }, {
    names: ['quantity', 'q'],
    type: 'integer',
    help: 'Quantity of the stock to purchase',
    default: 1,
  }, {
    names: ['version', 'v'],
    type: 'bool',
    help: 'Print the current version and exit.',
  }],
})

class SellCommand {
  constructor({ baseUrl, argv, credentialsFile }) {
    if (isEmpty(baseUrl)) throw new Error('Missing required parameter: baseUrl')
    if (isEmpty(credentialsFile)) throw new Error('Missing required parameter: credentialsFile')

    this.options = mapKeys(camelCase, parser.parse(argv))
    this.options.baseUrl = baseUrl
    this.options.credentialsFile = credentialsFile
    this.options.ticker = first(this.options.args)
  }

  run() {
    const {
      baseUrl,
      credentialsFile,
      help,
      quantity,
      ticker,
      version,
    } = this.options

    if (help) {
      console.log(this.usage()) // eslint-disable-line no-console
      process.exit(0)
    }

    if (version) {
      console.log(packageJson.version) // eslint-disable-line no-console
      process.exit(0)
    }

    if (isEmpty(ticker)) {
      console.error(this.usage())
      console.error(chalk.red('Missing a <TICKER>'))
      process.exit(1)
    }

    const tradingPost = new TradingPost({ baseUrl, credentialsFile })
    tradingPost.createSellOrder({ quantity, ticker }, (error, sellOrder) => {
      if (error) throw error
      console.log(JSON.stringify(sellOrder, null, 2))
      process.exit(0)
    })
  }

  usage() {
    return `
USAGE:
    ${packageJson.name} [GLOBALOPTS] sell [OPTIONS] <TICKER>

EXAMPLE:
    ${packageJson.name} sell --quantity 100 GOOG

OPTIONS:
${parser.help({ includeEnv: true, indent: 4 })}
    `.trim()
  }
}

module.exports = SellCommand
