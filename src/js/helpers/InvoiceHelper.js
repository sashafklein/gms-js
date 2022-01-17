class InvoiceHelper {
  static _invoiceKey = () => (this._isTip() ? "tipInvoice" : "invoice");

  // If there's a tip invoice, regular invoice has been paid.
  static _isTip = () => !!gms.state.tipInvoice;

  static _api = () => gms.api(this._isTip() ? gms.tipService : undefined);

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
          gms.updateState({
            stage: invoice.status,
            [this._invoiceKey()]: invoice,
          });
        } else {
          gms.updateState({
            [this._invoiceKey()]: invoice,
          });
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
        [this._invoiceKey()]: invoice,
      });
      this.pollForInvoice(invoice);
    });
  };
}

export default InvoiceHelper;
