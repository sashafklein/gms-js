// If there's a tip invoice, regular invoice has been paid.
const _isTip = () => !!gms.state.tipInvoice;

const _api = () => gms.api(_isTip() ? gms.tipService : undefined);

const _invoiceKey = () => (_isTip() ? "tipInvoice" : "invoice");

const pollForInvoice = (invoice) => {
  if (!invoice) {
    return;
  }

  _api()
    .checkInvoice(invoice)
    .then((invoice) => {
      if (["EXPIRED", "PAID"].includes(invoice.status)) {
        gms.updateState({
          stage: invoice.status,
          [_invoiceKey()]: invoice,
        });
      } else {
        gms.updateState({
          [_invoiceKey()]: invoice,
        });
        setTimeout(() => {
          pollForInvoice(invoice);
        }, 1000);
      }
    });
};

const getInvoiceAndPoll = (data) => {
  const api = _api();
  const result = api.getInvoice(data);
  result.then((invoice) => {
    gms.updateState({
      stage: _isTip() ? "TIP_INVOICE" : "INVOICE",
      [_invoiceKey()]: invoice,
    });
    pollForInvoice(invoice);
  });
};

class InvoiceHelper {}

InvoiceHelper.pollForInvoice = pollForInvoice;
InvoiceHelper.getInvoiceAndPoll = getInvoiceAndPoll;

export default InvoiceHelper;
