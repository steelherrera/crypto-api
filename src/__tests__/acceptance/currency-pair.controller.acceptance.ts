import {Client, expect} from '@loopback/testlab';
import {CurrencyApiApplication} from '../..';
import {CurrencyPairRepository} from '../../repositories';
import {setupApplication} from './test-helper';

describe('CurrencyPairController', () => {
  let app: CurrencyApiApplication;
  let client: Client;
  let currencyPairRepo: CurrencyPairRepository;

  const stubRepository = () => {
    app.bind('repositories.CurrencyPairRepository').to({
      getAveragePrice: () => {
        return new Promise((resolve) => resolve([{
          "_id": "BTCUSDT",
          "average": 55000
        }]));
      },
    });
  };

  const stubService = () => {
    app.bind('services.BinanceService').to({
      getAverage: () => {
        return {
          mins: 5,
          price: 55000
        }
      }
    });
  };

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    currencyPairRepo = await app.getRepository(CurrencyPairRepository);
    stubService();
  });

  after(async () => {
    await app.stop();
  });

  it('invokes POST /pairs', async () => {
    const res = await client.post('/pairs').send({"symbol": "BTCUSDT"});
    expect(res.body).to.have.property('transactionId');
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.property('code');
    expect(res.body.message).to.have.property('_id');
    expect(res.body.message).to.have.property('symbol');
    expect(res.body.message).to.have.property('lectures');
  });

  it('invokes GET /pairs', async () => {
    const res = await client.get('/pairs');
    expect(res.body).to.have.property('transactionId');
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.property('code');
  });

  it('invokes GET /average expect failure', async () => {
    const res = await client.get('/average');
    expect(res.statusCode).to.eql(400);
    expect(res.body).to.have.property('transactionId');
    expect(res.body).to.have.property('message');
    expect(res.body).to.have.property('code');
    expect(res.body.message).to.eql('Symbol is a required attribute.');
  });

  it('invokes GET /average expect failure', async () => {
    stubRepository();
    const res = await client.get('/average?filter={"where":{"symbol":"BTCUSDT"}}');
    expect(res.statusCode).to.eql(200);
    expect(res.body).to.have.property('transactionId');
    expect(res.body).to.have.property('message');
    expect(res.body.message[0]).to.have.property('_id');
    expect(res.body.message[0]._id).to.eql('BTCUSDT');
    expect(res.body.message[0]).to.have.property('average');
    expect(res.body).to.have.property('code');
  });
});
