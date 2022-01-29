export const expirationTimer = (secondsLeft) => {
  let time = `${secondsLeft}s`;

  if (secondsLeft > 60) {
    const mins = parseInt(secondsLeft / 60.0);
    const secs = secondsLeft - mins * 60;
    time = `${mins}m ${secs}s`;
  }

  return `Expires in ${time}`;
};

class InvoiceHelper {
  static _invoiceKey = () => (this._isTip() ? "tipInvoice" : "invoice");

  // If there's a tip invoice, regular invoice has been paid.
  static _isTip = () => !!gms.state.tipInvoice;

  static _api = () => gms.api(this._isTip() ? gms.tipService : undefined);

  static _invoiceState = (invoice) => ({ [this._invoiceKey()]: invoice });

  static _pollAgainInOneSecond = (invoice) => {
    setTimeout(() => {
      this.pollForInvoice(invoice);
    }, 1000);
  };

  static pollForInvoice = (invoice) => {
    if (!invoice) {
      return;
    }

    this._api()
      .checkInvoice(invoice)
      .then((invoice) => {
        if (["EXPIRED", "PAID"].includes(invoice.status)) {
          const state = {
            ...this._invoiceState(invoice),
            stage: invoice.status,
          };
          console.log("UPDATING POST PAYMENT", state);
          gms.updateState(state);
        } else {
          gms.updateState(this._invoiceState(invoice), {
            selector: ".gms-invoice-expiry",
            innerHTML: expirationTimer(invoice.secondsLeft),
          });
          this._pollAgainInOneSecond(invoice);
        }
      })
      .catch((error) => {
        console.error(error);
        gms.updateState({ stage: "ERROR" });
      });
  };

  static getInvoiceAndPoll = (data) => {
    const api = this._api();
    const result = api.getInvoice(data);
    result
      .then((invoice) => {
        gms.updateState({
          stage: this._isTip() ? "TIP_INVOICE" : "INVOICE",
          ...this._invoiceState(invoice),
        });
        this.pollForInvoice(invoice);
      })
      .catch((error) => {
        console.error(error);
        gms.updateState({ stage: "ERROR" });
      });
  };
}

export default InvoiceHelper;
