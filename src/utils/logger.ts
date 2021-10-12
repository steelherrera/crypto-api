import Winston from 'winston';

export class Logger {

  transactionId: string;
  tag: string;
  logger: Winston.Logger;

  // eslint-disable-next-line
  constructor(transactionId: string|any, tag: string){
    this.transactionId = transactionId;
    this.tag = tag;
    const myformat: Winston.Logform.Format = Winston.format.combine(
      Winston.format.colorize(),
      Winston.format.align(),
      Winston.format.printf(info => `${new Date().toUTCString()} ${info.level}:${info.message}`)
    );
    this.logger = Winston.createLogger({
      transports: [
        /**
         * Add transports
         */
        new Winston.transports.Console({
          format: myformat
        })
      ]
    });
  }

  info(message: string): void {
    const log = `[${this.transactionId}] ${this.tag} -- ${message}`;
    this.logger.info(log);
  }

  warn(message: string): void {
    const log = `[${this.transactionId}] ${this.tag} -- ${message}`;
    this.logger.warn(log);
  }

  error(message: string): void {
    const log = `[${this.transactionId}] ${this.tag} -- ${message}`;
    this.logger.error(log);
  }

}