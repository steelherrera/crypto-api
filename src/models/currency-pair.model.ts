import {Entity, model, property} from '@loopback/repository';

type Lecture = {
  date: string;
  price: number;
}

@model()
export class CurrencyPair extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  symbol: string;

  @property({
    type: 'array',
    itemType: 'object',
    jsonSchema:{
      type: 'array',
      required: ['date', 'price'],
      additionalProperties: false,
      items: {
        type: 'object',
        properties:{
          date:{
            type: 'string'
          },
          price:{
            type: 'number'
          }
        }
      }
    },
    required: true,
  })
  lectures: Lecture[];

  constructor(data?: Partial<CurrencyPair>) {
    super(data);
  }
}

export interface CurrencyPairRelations {
  // describe navigational properties here
}

export type CurrencyPairWithRelations = CurrencyPair & CurrencyPairRelations;
