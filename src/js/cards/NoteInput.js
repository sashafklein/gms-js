import InvoiceHelper from "../helpers/InvoiceHelper";
import modalContent from "../pieces/modalContent";

const NoteInput = () => {
  const { to, displayName, amountIsFixed, noteIsFixed, noteRequired } =
    gms.settings();

  const { amount } = gms.state;
  const note = gms.state.note || gms.settings().note;

  if (noteRequired && !note?.length) {
    throw new Error(
      "GimmeSats -- Bad settings: 'noteRequired' was set to true with empty note."
    );
  }

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
          <textarea class="gms-note-input">${note}</textarea>`
    }
    `;

  const makeActionObjects = ({ body }) => {
    const input = body.getElementsByTagName("textarea")[0];
    return [
      {
        onClick: () => {
          gms.updateState({ stage: "LOADING", note: input.value });

          InvoiceHelper.getInvoiceAndPoll({
            to: gms.settings().to,
            amount: gms.state.amount,
            note: input.value,
          });
        },
        disabled: noteRequired && !input.value.length,
        text: "Get invoice",
      },
      {
        onClick: amountIsFixed
          ? () => gms.close()
          : () => gms.updateState({ stage: "AMOUNT_INPUT" }),
        text: amountIsFixed ? "Cancel" : "Back",
      },
    ];
  };

  const { content, body, actions } = modalContent(
    `<h1>Pay ${displayName || to}</h1>`,
    bodyContent,
    makeActionObjects
  );

  const input = body.getElementsByTagName("textarea")[0];
  const handleInput = (event) => {
    const { target } = event;

    const primary = actions.children[0];
    primary.disabled = !target.value.length;
  };
  input.oninput = handleInput;

  return content;
};

export default NoteInput;
