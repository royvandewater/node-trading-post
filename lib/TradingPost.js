const fs = require('fs')
const jsonwebtoken = require('jsonwebtoken')
const isEmpty = require('lodash/fp/isEmpty')
const request = require('request')

class TradingPost {
  constructor({ baseUrl, credentialsFile }) {
    if (isEmpty(baseUrl)) throw new Error('Missing required parameter: baseUrl')
    if (isEmpty(credentialsFile)) throw new Error('Missing required parameter: credentialsFile')
    this.credentialsFile = credentialsFile
    this.request = request.defaults({ baseUrl, json: true })
  }

  createBuyOrder({ quantity, ticker }, callback) {
    this._getAccessToken((error, accessToken) => {
      const options = {
        auth: { bearer: accessToken },
        json: { quantity, ticker },
      }

      this.request.post('/profile/buy-orders', options, (error, response) => {
        if (error) return callback(error)
        if (response.statusCode !== 201) return callback(new Error(`Expected status code 201, received ${response.statusCode}\n${response.body}`))

        callback(null, response.body)
      })
    })
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

    if (this._isValidAccessToken(credentials.access_token)) {
      return callback(null, credentials.access_token)
    }

    const json = {
      grant_type: 'refresh_token',
      refresh_token: credentials.refresh_token,
    }
    this.request.post('/tokens', { json }, (error, response) => {
      if (error) return callback(error)
      if (response.statusCode !== 201) return callback(new Error(`Refreshing Token: Expected status code 201, received ${response.statusCode}`))

      const { access_token } = response.body
      credentials.access_token = access_token // eslint-disable-line camelcase

      fs.writeFile(this.credentialsFile, JSON.stringify(credentials, null, 2), (error) => {
        if (error) return callback(error)

        return callback(null, access_token)
      })
    })
  }

  _isValidAccessToken(accessToken) {
    if (isEmpty(accessToken)) return false

    try {
      jsonwebtoken.decode(accessToken)
    } catch (error) {
      // Types of errors thrown include:
      //   JsonWebTokenError (https://github.com/auth0/node-jsonwebtoken#jsonwebtokenerror)
      //   TokenExpiredError (https://github.com/auth0/node-jsonwebtoken#tokenexpirederror)
      return false
    }

    return true
  }
}

module.exports = TradingPost
