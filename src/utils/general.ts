type GeneralResponse = {
  transactionId: string;
  code: number;
  message: string;
};

export class GeneralUtilities {

  constructor(
  ) {
  }

  buildResponse(transactionId: string, code: number, message: string): GeneralResponse {
    return {
      transactionId,
      code,
      message
    };
  }
}