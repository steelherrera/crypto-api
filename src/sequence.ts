import { AUTHENTICATION_STRATEGY_NOT_FOUND, USER_PROFILE_NOT_FOUND } from '@loopback/authentication';
import { inject } from '@loopback/core';
import {ExpressRequestHandler, FindRoute, InvokeMethod, InvokeMiddleware, ParseParams, Reject, RequestContext, Send, SequenceActions, SequenceHandler} from '@loopback/rest';
import cors from 'cors';
import requestId from 'express-request-id';
import { UtilsBindings } from './keys';
import { GeneralUtilities } from './utils/general';

import {Logger} from './utils/logger';

const middlewareList: ExpressRequestHandler[] = [
    cors({}),
    requestId({})
];

export class MySequence implements SequenceHandler {
    @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
    invokeMiddleware: InvokeMiddleware = () => false;

    Logger: Logger;

    constructor(
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) public send: Send,
        @inject(SequenceActions.REJECT) public reject: Reject,
        @inject(UtilsBindings.UTILS) public utils: GeneralUtilities,
    ){
    }
    async handle(context: RequestContext) {
        const {request, response} = context;
        try {
          const finished = await this.invokeMiddleware(context, middlewareList);
          if (finished) return;
          request.headers.transactionId = request.id;
          this.Logger = new Logger(request.headers.transactionId, `${request.method} ${request.originalUrl}`);
          const route = this.findRoute(request);
          const args = await this.parseParams(request, route);
          this.Logger.info("Request: " + JSON.stringify(request.body));
          const result = await this.invoke(route, args);
          const customResponse = this.utils.buildResponse(request.headers.transactionId, response.statusCode, result);
          this.Logger.info("Response: " + JSON.stringify(customResponse));
          this.send(response, (request.originalUrl.includes("/v1/explorer")) ? result : customResponse);
        // eslint-disable-next-line
        } catch (err: any) {
          console.error(err);
          console.log(JSON.stringify(err));
          if (
            err.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
            err.code === USER_PROFILE_NOT_FOUND
          ) {
            Object.assign(err, {statusCode: 401});
          } else if (!err.statusCode) {
            Object.assign(err, {statusCode: 500});
          }
          this.Logger.error(err);
          const customResponse = this.utils.buildResponse(request.id, err.statusCode, (err.details) ? {"message": err.message, "details": err.details} : err.message);
          response.statusCode = err.statusCode;
          this.Logger.info("Response: " + JSON.stringify(customResponse));
          this.send(response, customResponse);
          this.reject(context, err);
          return;
        }
    }

}
