#!/usr/bin/env node

/* eslint-disable no-console */

const chalk = require('chalk')
const dashdash = require('dashdash')
const fs = require('fs')
const camelCase = require('lodash/fp/camelCase')
const concat = require('lodash/fp/concat')
const has = require('lodash/fp/has')
const isEmpty = require('lodash/fp/isEmpty')
const mapKeys = require('lodash/fp/mapKeys')

const BuyCommand = require('./lib/commands/BuyCommand')
const SellCommand = require('./lib/commands/SellCommand')
const UserCommand = require('./lib/commands/UserCommand')
const packageJson = require('./package.json')

const COMMANDS = {
  buy: {
    run: ({ argv, baseUrl, credentialsFile }) => { new BuyCommand({ argv, baseUrl, credentialsFile }).run() },
    help: 'Buy a stock',
  },
  sell: {
    run: ({ argv, baseUrl, credentialsFile }) => { new SellCommand({ argv, baseUrl, credentialsFile }).run() },
    help: 'Sell a stock',
  },
  user: {
    run: ({ argv, baseUrl, credentialsFile }) => { new UserCommand({ argv, baseUrl, credentialsFile }).run() },
    help: 'Show user information',
  },
}

const parser = dashdash.createParser({
  interspersed: false,
  options: [{
    names: ['base-url', 'b'],
    type: 'string',
    help: 'URL where the trading-post API can be found',
    default: 'https://trading-post.club',
  }, {
    names: ['credentials-file', 'c'],
    type: 'string',
    help: '[Required] Must be a JSON file and contain a refresh_token. access_token will automatically be retrieved and cached here.',
    default: './credentials.json',
  }, {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Print this help and exit.',
  }, {
    names: ['version', 'v'],
    type: 'bool',
    help: 'Print the current version and exit.',
  }],
})

class Command {
  constructor({ argv }) {
    this.options = mapKeys(camelCase, parser.parse(argv))
  }

  run() {
    if (this.options.help) {
      console.log(this.usage())
      process.exit(0)
    }

    if (this.options.version) {
      console.log(packageJson.version)
      process.exit(0)
    }

    const { args, baseUrl, credentialsFile } = this.options
    this.validateCredentialsFile(credentialsFile)
    const [command] = args
    if (isEmpty(command)) {
      console.error(this.usage())
      console.error(chalk.red('\nMissing a <command>'))
      process.exit(1)
    }

    if (!has(command, COMMANDS)) {
      console.error(this.usage())
      console.error(chalk.red(`\nInvalid <command>: "${command}"`))
      process.exit(1)
    }
    COMMANDS[command].run({
      argv: concat(['node'], args),
      baseUrl,
      credentialsFile,
    })
  }

  usage() {
    return `
USAGE:
    ${packageJson.name} [GLOBALOPTS] <command> [OPTIONS]

GLOBALOPTS:
${parser.help({ includeEnv: true, indent: 4 })}
COMMANDS:
    user    Show user information
    `.trim()
  }

  validateCredentialsFile(credentialsFile) {
    if (isEmpty(credentialsFile)) {
      console.error(this.usage())
      console.error(chalk.red('Missing required global option --credentials-file, -c'))
      process.exit(1)
    }

    let credentialsStr
    try {
      credentialsStr = fs.readFileSync(credentialsFile, 'utf8')
    } catch (error) {
      console.error(this.usage())
      console.error(chalk.red(`Could not access file at "${credentialsFile}": \n${error.stack}`))
      process.exit(1)
    }

    let credentials
    try {
      credentials = JSON.parse(credentialsStr)
    } catch (error) {
      console.error(this.usage())
      console.error(chalk.red(`Could not parse JSON in "${credentialsFile}": \n${error.stack}`))
      process.exit(1)
    }

    if (isEmpty(credentials.refresh_token)) {
      console.error(this.usage())
      console.error(chalk.red(`File at "${credentialsFile}" is missing the key "refresh_token"`))
      process.exit(1)
    }
  }
}

module.exports = Command
if (!module.parent) {
  const command = new Command({ argv: process.argv })
  command.run()
}
