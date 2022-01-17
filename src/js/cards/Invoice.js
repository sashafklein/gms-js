import QR from "qrcode";

import modalContent from "../pieces/modalContent";

import InvoiceHelper from "../helpers/InvoiceHelper";

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
  console.log({ expired }, stage, secondsLeft, invoice);
  // TODO: Toggle to Onchain
  const invoiceString = lnInvoice;

  const headerContent = `
    <h1>${tipInvoice ? gms.tipDisplayName : displayName || to}</h1>
    <h2>$${amount.toFixed(2)}</h2>
    <p>${note}</p>
  `;

  const bodyContent = `
    <div
      class="gms-qr"
      ${
        // Uncomment for header-click shortcut to expiry
        // onClick={() => actions.updateState({ stage: EXPIRED })
        ""
      }
    >
      ${expired ? `<div class="gms-qr__expired"></div>` : `<canvas></canvas>`}
    </div>
    <p class="gms-invoice-expiry">${
      expired ? "Expired" : `Expires in ${secondsLeft}s`
    }</p>
  `;

  const makeActionObjects = () => [
    {
      onClick: expired
        ? () =>
            InvoiceHelper.getInvoiceAndPoll(
              tipInvoice
                ? {
                    to: gms.tipTo,
                    amount: stateAmount * 0.05,
                    note: gms.tipNote,
                  }
                : {
                    to: gms.settings.to,
                    amount: stateAmount,
                    note: gms.note.amount,
                  }
            )
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

    // TODO: Remove. Simulates payment on QR click
    if (window.location.href.includes("http://localhost:3000")) {
      canvas.onclick = () => {
        gms.updateState({ stage: "PAID" });
      };
    }
  }

  return content;
};

export default Invoice;
