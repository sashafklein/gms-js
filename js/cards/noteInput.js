import API from "../api/index";
import modalContent from "../pieces/modalContent";

const noteInput = (settings) => {
  const { to, displayName, note, amount, amountIsFixed, noteIsFixed } =
    settings;

  if (noteIsFixed && !note?.length) {
    throw new Error(
      "GimmeSats -- Bad settings: 'noteIsFixed' was set to true with empty note."
    );
  }

  const api = new API();

  const bodyContent = `
    ${
      noteIsFixed
        ? `
          <h2>$${(amount || 0).toFixed(2)}</h2>
          <p>${note}</p>
        `
        : `
          <div class="gms-modal-row">
            <h2 style="margin-right: 10px">$</h2>
            <h1 class="gms-large-text">${(amount || 0).toFixed(2)}</h1>
          </div>
          <h2>Add a note</h2>
          <textarea
            class="gms-note-input"
            value=${note}
          />`
    }
    `;

  const makeActionObjects = ({ body }) => {
    const input = body.getElementsByTagName("textarea")[0];
    return [
      {
        onClick: () => {
          gms.settings = { note: input.value };
          api.getInvoiceAndUpdateApp();
        },
        disabled: !input.value.length,
        text: "Get invoice",
      },
      {
        onClick: amountIsFixed
          ? () => gms.close()
          : () => gms.update({ stage: "AMOUNT_INPUT" }),
        text: amountIsFixed ? "Cancel" : "Back",
      },
    ];
  };

  const { content } = modalContent(
    `<h1>Pay ${displayName || to}</h1>`,
    bodyContent,
    makeActionObjects
  );

  return content;
};

export default noteInput;
