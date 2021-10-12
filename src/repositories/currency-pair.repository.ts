import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {CurrencyPair, CurrencyPairRelations} from '../models';

type GetAverageResponse = {
  "_id": string;
  "price": number;
};

export class CurrencyPairRepository extends DefaultCrudRepository<
  CurrencyPair,
  typeof CurrencyPair.prototype._id,
  CurrencyPairRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(CurrencyPair, dataSource);
  }

  async getAveragePrice(symbol: string, numberOfLectures: number): Promise<GetAverageResponse[]>{
    const pipeline = [
      {
        "$match":{
          "symbol": symbol
        }
      },
      {
        "$unwind": "$lectures"
      },
      {
        "$sort": {
          "lectures.date": -1
        }
      },
      {
        "$limit": numberOfLectures
      },
      {
        "$group":{
        "_id": "$symbol",
        "averagePrice":{
          "$avg": "$lectures.price"
        }
      }}];
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line
        this.execute(this.modelClass.name, "aggregate", pipeline, (err: any, data: any) => {
          if (err) {
            reject(err);
          }
          resolve(data.toArray());
        })
      });
  }
}
