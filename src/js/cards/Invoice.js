import QR from "qrcode";

import modalContent from "../pieces/modalContent";

import InvoiceHelper, { expirationTimer } from "../helpers/InvoiceHelper";

const Invoice = () => {
  const { displayName, to } = gms.settings();
  const { stage, tipInvoice, amount: stateAmount, note: stateNote } = gms.state;
  const setAmount = stateAmount || gms.settings().amount;
  const amount = tipInvoice
    ? Math.max(0.05 * setAmount, gms.tipMin)
    : setAmount;

  const note = tipInvoice ? gms.tipNote : stateNote || gms.settings().note;

  const invoice = tipInvoice || gms.state.invoice;

  const { secondsLeft, lnInvoice } = invoice;

  const expired = stage === "EXPIRED" || secondsLeft <= 0;

  gms.log("INVOICE", { expired, note, invoice, tipInvoice, amount });

  // TODO: Toggle to Onchain
  const invoiceString = lnInvoice;

  const headerContent = `
    <h1>${tipInvoice ? gms.tipDisplayName : displayName || to}</h1>
    <h2>$${amount.toFixed(2)}</h2>
    <p>${note}</p>
  `;

  const bodyContent = `
    <div class="gms-qr">
      ${expired ? `<div class="gms-qr__expired"></div>` : `<canvas></canvas>`}
    </div>
    <p class="gms-invoice-expiry">${
      expired ? "Expired" : expirationTimer(secondsLeft)
    }</p>
  `;

  const makeActionObjects = () => [
    {
      onClick: expired
        ? () =>
            InvoiceHelper.getInvoiceAndPoll({
              to: tipInvoice ? gms.tipTo : gms.settings.to,
              amount: amount,
              note,
            })
        : () => navigator.clipboard.writeText(invoiceString),
      text: expired ? "Refresh" : "Copy",
    },
    {
      onClick: () => {
        gms.updateState({ stage: "NOTE_INPUT", invoice: undefined });
      },
      text: "Back",
    },
  ];

  const { content, body } = modalContent(
    headerContent,
    bodyContent,
    makeActionObjects
  );

  const canvas = body.getElementsByTagName("canvas")[0];

  if (canvas) {
    QR.toCanvas(canvas, lnInvoice, { width: 200 }, function (error) {
      if (error) {
        console.error(error);
        throw new Error(`GimmeSats - QR failed to render.`);
      }
    });
  }

  return content;
};

export default Invoice;
