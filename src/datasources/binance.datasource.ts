import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  "name": 'Binance',
  "connector": 'rest',
  "baseURL": "https://api.binance.com/api/v3",//'https://api.binance.com/api/v3',
  "crud": false,
  "options": {
    "headers": {
      "accept": 'application/json',
      'content-type': 'application/json',
    },
  },
  "operations": [
    {
      "template": {
        "method": "GET",
        "url": "https://api.binance.com/api/v3/avgPrice?symbol={symbol}"
      },
      "functions": {
        "getAverage": ["symbol"]
      }
    }
  ]
};

@lifeCycleObserver('datasource')
export class BinanceDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'Binance';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.Binance', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
