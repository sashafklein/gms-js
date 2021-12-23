import modalContent from "../pieces/modalContent";

const amountInput = (settings) => {
  const { amount, amountIsFixed, to, displayName } = settings;

  if (amountIsFixed && !amount) {
    throw new Error(
      "GimmeSats -- Bad settings: 'amountIsFixed' was set to true with empty amount."
    );
  }

  const bodyContent = `
      <h2>${amountIsFixed ? `$${amount.toFixed(2)}` : "Enter an amount"}</h2>
      ${
        amountIsFixed
          ? ""
          : `
        <div class="gms-modal-row" style='margin-left: -20px'>
          <h2 style="margin-right: 10px">$</h2>
          <input
            type="number"
            class="gms-amount-input"
            value=${amount.toFixed(2)}
          />
        </div>`
      }
    `;

  const makeActionObjects = ({ body }) => {
    const input = body.getElementsByClassName("gms-amount-input")[0];
    return [
      {
        text: "Next",
        disabled: !amount,
        onClick: () => {
          gms.update({
            amount: parseFloat(input.value),
            stage: gms.nextStage(),
          });
        },
      },
      {
        text: "Cancel",
        onClick: () => gms.close(),
      },
    ];
  };

  const { content, body, actions } = modalContent(
    `<h1>Pay ${displayName || to}</h1>`,
    bodyContent,
    makeActionObjects
  );
  const input = body.getElementsByClassName("gms-amount-input")[0];

  const handleNumInput = (event) => {
    const { target } = event;
    // Format number appropriately
    const cleaned = parseFloat(target.value).toFixed(2);

    if (cleaned !== target.value) {
      target.value = cleaned;
    }

    const primary = actions.children[0];
    primary.disabled = !(parseFloat(cleaned) > 0);
  };

  input.oninput = handleNumInput;
  return content;
};

export default amountInput;
