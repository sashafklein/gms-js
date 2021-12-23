import BaseApi from "./base";

export default class Strike extends BaseApi {
  _basePath = () => "https://api.zaphq.io/api/v0.4/public";

  getInvoice = async () => {
    const settings = this._settings();
    const { to, note } = settings;
    const amount = settings.amount;
    const includeOnchainAddress = amount >= 10;
    const body = {
      description: note,
      includeOnchainAddress,
      amount: {
        currency: "USD",
        amount: amount.toFixed(2),
      },
    };

    console.log("BEFORE");
    const resp = await fetch(this._path(`users/${to}/pay`), {
      method: "POST",
      body: body,
    });
    console.log("AFTER", resp);
    const data = await resp.json();
    console.log("BOOYAH", data);

    return Promise.resolve({
      lnInvoice: data.lnInvoice,
      secondsLeft: data.expirySecond - BaseApi.secondsToExpireEarly,
      btcInvoice: data.onchainAddress,
      invoiceId: data.quoteId,
    });
  };

  checkForPayment = async () => {
    const resp = await fetch(
      this._path(`receive/${this._invoice().invoiceId}`)
    );
    const data = await resp.json();

    return Promise.resolve({
      ...this._invoice(),
      secondsLeft: data.expirySecond - BaseApi.secondsToExpireEarly,
      status: data.result === "PAID" ? "PAID" : undefined,
    });
  };
}
