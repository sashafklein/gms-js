import BaseApi from "./base";

const delay = process.env.NODE_ENV === "test" ? 0 : 800;

class Mock extends BaseApi {
  _basePath = () => "mock.net";

  _mockInvoice = (overrides = {}) => ({
    lnInvoice: "ln-invoice-nice-and-long-for-visual",
    secondsLeft: Math.floor(Math.random() * 60),
    btcInvoice: "btc-invoice",
    invoiceId: "invoice-id",
    ...overrides,
  });

  getInvoice = () => {
    const invoice = this._mockInvoice();

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
