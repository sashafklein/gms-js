import BaseApi from "./base";
import { INVOICE, PAID } from "../const";
import { Invoice } from "../types";

export default class Mock extends BaseApi {
  _basePath = () => "mock.net";

  _mockInvoice = (overrides = {}) => ({
    lnInvoice: "ln-invoice",
    secondsLeft: 56,
    btcInvoice: "btc-invoice",
    invoiceId: "invoice-id",
    ...overrides,
  });

  // @ts-ignore
  getInvoice = (expired = false) => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            this._mockInvoice({ secondsLeft: expired ? 0 : 45 }) as Invoice
          ),
        800
      );
    });
  };

  // @ts-ignore
  checkForPayment = (paid = true) => {
    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            this._mockInvoice({ stage: paid ? PAID : INVOICE }) as Invoice
          ),
        800
      );
    });
  };
}
