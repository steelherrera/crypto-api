import { CronJob, cronJob } from '@loopback/cron';
import { inject } from '@loopback/core';
import { BinanceService } from '../services';
import { repository } from '@loopback/repository';
import { CurrencyPairRepository } from '../repositories';
import { HttpErrors } from '@loopback/rest';

const MAX_LECTURES = process.env.MAX_LECTURES ?? 10000;

@cronJob()
export class CurrenciesCronJob extends CronJob {
    constructor(
        @repository(CurrencyPairRepository) public currencyPairRepository: CurrencyPairRepository,
        @inject('services.BinanceService') protected binanceService: BinanceService,
    ) {
        super({
            name: 'consume.currencies.job',
            onTick: async () => {
                await this.updateCurrencies();
            },
            cronTime: "0 * * * *",
            start: true,
        });
    }

    async updateCurrencies() {
        const currencies = await this.currencyPairRepository.find({ fields: ['symbol', 'lectures'] });
        for (const currency of currencies) {
            try {
                const response = await this.binanceService.getAverage(currency.symbol);
                if(response.price){
                    currency.lectures.push({
                        date: (new Date()).toISOString(),
                        price: parseFloat(parseFloat(response.price).toFixed(2))
                    });
                    currency.lectures.length > MAX_LECTURES ? currency.lectures.shift() : null;
                    await this.currencyPairRepository.updateAll({ lectures: currency.lectures }, { _id: currency._id });
                }
                // eslint-disable-next-line
            } catch (ex: any) {
                if (ex.statusCode && ex.message) {
                    const exMsg = typeof ex === "object" && JSON.parse(ex.message).msg ? JSON.parse(ex.message).msg : ex.message;
                    throw new HttpErrors[ex.statusCode](exMsg);
                }
                throw ex;
            }
        }
    }
}