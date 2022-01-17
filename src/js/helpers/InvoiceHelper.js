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
          gms.updateState(state);
        } else {
          gms.updateState(this._invoiceState(invoice));
          this._pollAgainInOneSecond(invoice);
        }
      });
  };

  static getInvoiceAndPoll = (data) => {
    const api = this._api();
    const result = api.getInvoice(data);
    result.then((invoice) => {
      gms.updateState({
        stage: this._isTip() ? "TIP_INVOICE" : "INVOICE",
        ...this._invoiceState(invoice),
      });
      this.pollForInvoice(invoice);
    });
  };
}

export default InvoiceHelper;
