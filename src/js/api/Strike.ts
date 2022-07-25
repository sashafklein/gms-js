import axios from "axios";
import BaseApi from "./base";
import { gms, InvoiceRequest } from "../types";

export default class Strike extends BaseApi {
  _basePath = () => "https://api.zaphq.io/api/v0.4/public";

  getInvoice = async ({ to, note, amount }: InvoiceRequest) => {
    const includeOnchainAddress = amount >= 10;

    const body = {
      description: note,
      includeOnchainAddress,
      amount: {
        currency: "USD",
        amount: amount.toFixed(2),
      },
    };

    gms.log("STRIKE GET INVOICE", body);

    const path = this._path(`users/${to}/pay`);
    const { data } = await axios.post(path, body);

    return Promise.resolve({
      lnInvoice: data.lnInvoice,
      secondsLeft: data.expirySecond - BaseApi.secondsToExpireEarly,
      btcInvoice: data.onchainAddress,
      invoiceId: data.quoteId,
    });
  };

  checkInvoice = async (invoice) => {
    const { data } = await axios.get(
      this._path(`receive/${invoice.invoiceId}`)
    );

    const { result, expirySecond } = data;
    const secondsLeft = expirySecond - BaseApi.secondsToExpireEarly;
    const status =
      result === "PAID" ? "PAID" : secondsLeft <= 0 ? "EXPIRED" : "LIVE";

    return Promise.resolve({
      ...invoice,
      secondsLeft,
      status,
    });
  };
}
