import {Logger} from './../../utils/logger';

declare global {
  namespace Express {
    interface Request {
      id: string,
      logger: Logger
    }
  }
}
