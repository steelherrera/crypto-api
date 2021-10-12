import { inject } from '@loopback/core';
import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {CurrencyPair} from '../models';
import {CurrencyPairRepository} from '../repositories';
import { BinanceService } from '../services/binance.service';

type GetAverageRequest = {
  "numberOfLectures": number;
  "symbol": string;   
};

type GetAverageResponse = {
  "_id": string;
  "price": number;
};

const DEFAULT_LECTURES = 10;

export class CurrencyPairController {
  constructor(
    @repository(CurrencyPairRepository)
    public currencyPairRepository : CurrencyPairRepository,
    @inject('services.BinanceService') protected binanceService: BinanceService,
  ) {}

  @post('/pairs')
  @response(200, {
    description: 'CurrencyPair model instance',
    content: {'application/json': {schema: getModelSchemaRef(CurrencyPair)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CurrencyPair, {
            title: 'NewCurrencyPair',
            exclude: ['_id', 'lectures'],
          }),
        },
      },
    })
    currencyPair: Pick<CurrencyPair, Exclude<keyof CurrencyPair, ['_id', 'lectures']>>,
  ): Promise<CurrencyPair> {
    try{
      const serviceResp = await this.binanceService.getAverage(currencyPair.symbol);
      if(serviceResp.price){
        const pairValue = parseFloat(parseFloat(serviceResp.price).toFixed(2));
        currencyPair.lectures = [{
          date: new Date().toISOString(),
          price: pairValue
        }];
      }
      return this.currencyPairRepository.create(currencyPair);
    // eslint-disable-next-line
    }catch(ex: any){
      if(ex.statusCode && ex.message){
        const exMsg = typeof ex === "object" && JSON.parse(ex.message).msg ? JSON.parse(ex.message).msg : ex.message;
        throw new HttpErrors[ex.statusCode](exMsg);
      }
      throw ex;
    }
  }

  @get('/pairs')
  @response(200, {
    description: 'Array of CurrencyPair model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(CurrencyPair, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(CurrencyPair) filter?: Filter<CurrencyPair>,
  ): Promise<CurrencyPair[]> {
    return this.currencyPairRepository.find(filter);
  }

  @get('/average')
  @response(200, {
    description: 'Average price and number of lectures for a given pair',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties:{
            average:{
              type: 'number'
            },
            _id:{
              type: 'string'
            }
          }
        },
      },
    },
  })
  async getAveragePrice(
    @param.filter(CurrencyPair) filter?: Filter<CurrencyPair>,
  ): Promise<GetAverageResponse[]> {
    const req = filter?.where as GetAverageRequest;
    if(!req ?? !req.symbol){
      throw new HttpErrors.BadRequest("Symbol is a required attribute.");
    }
    return this.currencyPairRepository.getAveragePrice(req.symbol, req.numberOfLectures ?? DEFAULT_LECTURES);
  }
}