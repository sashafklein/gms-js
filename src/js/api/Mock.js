import BaseApi from "./base";

const delay = process.env.NODE_ENV === "test" ? 0 : 800;

class Mock extends BaseApi {
  _basePath = () => "mock.net";

  _mockInvoice = (overrides = {}) => ({
    lnInvoice: "ln-invoice",
    secondsLeft: 56,
    btcInvoice: "btc-invoice",
    invoiceId: "invoice-id",
    ...overrides,
  });

  getInvoice = (expired = false) => {
    const invoice = this._mockInvoice({ secondsLeft: expired ? 0 : 45 });

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(invoice);
      }, delay);
    });
  };

  checkInvoice = (paid = true) => {
    const invoice = this._mockInvoice({ stage: paid ? "PAID" : "INVOICE" });
    return new Promise((resolve) => {
      setTimeout(() => resolve(invoice), delay);
    });
  };
}

export default Mock;
