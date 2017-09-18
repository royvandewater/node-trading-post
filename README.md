# Trading Post
NPM module for interacting with the trading-post. Can be used as a library and/or a CLI tool

[![Build Status](https://travis-ci.org/royvandewater/node-trading-post.svg?branch=master)](https://travis-ci.org/royvandewater/node-trading-post)
[![npm version](https://badge.fury.io/js/trading-post.svg)](http://badge.fury.io/js/trading-post)

## Credentials

To obtain the information you'll need to build a `credentials.json`, 
you'll want to visit https://trading-post.club. After login, copy paste
just the `refresh_token` into a credentials.json like so: 

```json
{
  "refresh_token": "i-made-this-up"
}
```

Both the library & CLI tool will automatically exchange the `refresh_token` for
an `access_token` when necessary and cache it back in the credentials.json file. 

## CLI

### Install

```shell
yarn global add trading-post
```

### Example Usage

```shell
trading-post buy --quantity 100 goog
```

## Library

### Install

```shell
yarn add trading-post
```

### Usage

```javascript
const TradingPost = require('trading-post')
const tradingPost = new TradingPost({
  baseUrl: 'https://trading-post.club',
  credentialsFile: '/path/to/credentials.json',
})

tradingPost.getUser((error, user) => {
  if (error) throw error
  console.log(JSON.stringify(user))
  // =>
  // {
  //   "name": "Roy van de Water",
  //   "riches": 0,
  //   "stocks": [
  //     {
  //       "quantity": 0,
  //       "ticker": "goog"
  //     }
  //   ]
  // }
```

### Functions

#### Constructor
| Parameter               | Type   | Required | Description                                  |
| ------------------------| -------| -------- | -------------------------------------------- |
| options                 | object | yes      |                                              |
| options.baseUrl         | string | yes      | URL where the trading-post API can be found. |
| options.credentialsFile | string | yes      | Must point to a JSON file and contain a refresh_token. access_token will automatically be retrieved and cached here. |
---------------------------------------------------------------------------------------------
```javascript
const tradingPost  = new TradingPost({
  baseUrl: 'https://trading-post.club',
  credentialsFile: './credentials.json'
})
```

#### createBuyOrder
| Parameter        | Type     | Required | Description                                                        |
| ---------------- | -------- | -------- | ------------------------------------------------------------------ |
| options          | object   | yes      |                                                                    |
| options.quantity | string   | yes      | Quantity of stock to purchase                                      |
| options.ticker   | string   | yes      | Stock ticker name to purchase (case insensitive)                   |
| callback         | function | yes      | Will be called with error or buyOrder when the request is complete |
-------------------------------------------------------------------------------------------------------------
```javascript
tradingPost.createBuyOrder({ quantity: 1, ticker: 'goog' }, (error, buyOrder) => {
  if (error) throw error
  console.log(JSON.stringify(buyOrder, null, 2))
  // =>
  // {
  //   "id": "8c5989bb-400f-4232-877b-86b5de7ff5bb",
  //   "price": 920.29,
  //   "quantity": 1,
  //   "ticker": "goog",
  //   "timestamp": "2017-09-16T14:02:33.907049934Z"
  // }
})
```

#### createSellOrder
| Parameter        | Type     | Required | Description                                                         |
| ---------------- | -------- | -------- | ------------------------------------------------------------------- |
| options          | object   | yes      |                                                                     |
| options.quantity | string   | yes      | Quantity of stock to sell                                           |
| options.ticker   | string   | yes      | Stock ticker name to sell (case insensitive)                        |
| callback         | function | yes      | Will be called with error or sellOrder when the request is complete |
--------------------------------------------------------------------------------------------------------------
```javascript
tradingPost.createSellOrder({ quantity: 1, ticker: 'goog' }, (error, sellOrder) => {
  if (error) throw error
  console.log(JSON.stringify(buyOrder, null, 2))
  // =>
  // {
  //   "id": "e85d1724-2e84-48cc-8d4a-331f4fbd8477",
  //   "price": 920.29,
  //   "quantity": 1,
  //   "ticker": "goog",
  //   "timestamp": "2017-09-16T14:03:32.312353738Z"
  // }
})
```

#### getUser
| Parameter   | Type     | Required | Description                                                    |
| ----------- | -------- | -------- | -------------------------------------------------------------- |
| callback    | function | yes      | Will be called with error or user when the request is complete |
----------------------------------------------------------------------------------------------------
```javascript
tradingPost.getUser((error, user) => {
  if (error) throw error
  console.log(JSON.stringify(user, null, 2))
  // =>
  // {
  //   "name": "Roy van de Water",
  //   "riches": 0,
  //   "stocks": [
  //     {
  //       "quantity": 0,
  //       "ticker": "goog"
  //     }
  //   ]
  // }
})
```
