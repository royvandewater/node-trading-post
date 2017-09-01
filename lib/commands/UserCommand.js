const dashdash = require('dashdash')
const packageJson = require('../../package.json')

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
  constructor({ argv }) {
    this.options = parser.parse(argv)
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
