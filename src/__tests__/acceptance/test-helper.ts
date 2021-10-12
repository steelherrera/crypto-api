import {CurrencyApiApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new CurrencyApiApplication({
    rest: restConfig,
  });

  app.bind('datasources.config.mongodb').to({
    name: 'db',
    connector: 'memory'
  });

  /*app.bind('datasources.config.Binance').to({
    name: 'db',
    connector: 'memory',
    getAverage: () => {
      console.log("HERE AT GET AVERAGE");
    }
  });*/

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: CurrencyApiApplication;
  client: Client;
}
