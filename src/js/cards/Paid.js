import modalContent from "../pieces/modalContent";
import InvoiceHelper from "../helpers/InvoiceHelper";

const Paid = () => {
  const { content } = modalContent(
    `<h1>${gms.state.tipInvoice ? "Thank you!" : "Invoice paid!"}</h1>
     <h3>$${(gms.state.tipAmount || gms.state.amount).toFixed(2)}</h3>`,
    `<svg
      class="gms-success"
      xmlns="http://www.w3.org/2000/svg"
      viewbox="-26 -26 104 104"
    >
      <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"></circle>
      <path
        class="checkmark__check"
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      ></path>
    </svg>`,
    () => [
      gms.settings().suggestTip && !gms.state.tipInvoice
        ? {
            text: "Leave a Tip?",
            onClick: () => {
              const tipAmount = Math.max(gms.state.amount * 0.05, 0.05);
              gms.updateState({ stage: "LOADING", tipInvoice: {}, tipAmount });
              InvoiceHelper.getInvoiceAndPoll({
                to: gms.tipTo,
                amount: tipAmount,
                note: gms.tipNote,
              });
            },
          }
        : undefined,
      {
        text: "Done",
        onClick: () => gms.close(),
      },
    ]
  );

  return content;
};

export default Paid;
