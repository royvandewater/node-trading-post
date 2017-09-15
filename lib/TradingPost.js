const fs = require('fs')
const isEmpty = require('lodash/fp/isEmpty')
const request = require('request')

class TradingPost {
  constructor({ credentialsFile }) {
    if (isEmpty(credentialsFile)) throw new Error('Missing required parameter: credentialsFile')
    this.credentialsFile = credentialsFile
    this.request = request.defaults({ baseUrl: 'https://trading-post.club', json: true })
  }

  getUser(callback) {
    this._getAccessToken((error, accessToken) => {
      if (error) return callback(error)

      // const options = { headers: { Authorization: `Bearer ${accessToken}` } }
      const options = { auth: { bearer: accessToken } }
      this.request.get('/profile/', options, (error, response) => {
        if (error) return callback(error)
        if (response.statusCode !== 200) return callback(new Error(`Expected status code 200, received ${response.statusCode}\n${response.body}`))
        callback(null, response.body)
      })
    })
  }

  _getAccessToken(callback) {
    const credentials = JSON.parse(fs.readFileSync(this.credentialsFile, 'utf8'))

    const json = {
      grant_type: 'refresh_token',
      refresh_token: credentials.refresh_token,
    }
    this.request.post('/tokens', { json }, (error, response) => {
      if (error) return callback(error)
      if (response.statusCode !== 201) return callback(new Error(`Refreshing Token: Expected status code 201, received ${response.statusCode}`))
      return callback(null, response.body.access_token)
    })
  }
}

module.exports = TradingPost
