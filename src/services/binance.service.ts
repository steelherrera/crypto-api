import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {BinanceDataSource} from '../datasources';

export interface BinanceService {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getAverage(symbol: string): Promise<GetAverageResponse>;
}

export class BinanceServiceProvider implements Provider<BinanceService> {
  constructor(
    // Binance must match the name property in the datasource json file
    @inject('datasources.Binance')
    protected dataSource: BinanceDataSource = new BinanceDataSource(),
  ) {}

  value(): Promise<BinanceService> {
    return getService(this.dataSource);
  }
}

export interface GetAverageResponse {
  mins: number;
  price: string;
}
