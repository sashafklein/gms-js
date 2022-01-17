import userEvent from "@testing-library/user-event";
import "jest-canvas-mock";
import InvoiceHelper from "../src/js/helpers/InvoiceHelper";

import GMS from "../src/js/load";
import { prepDocument } from "./helpers";

const get = (el, selector, index = 0) => {
  return (
    el.getElementsByClassName(selector)[index] ||
    el.getElementsByTagName(selector)[index]
  );
};

const baseSettings = { to: "whomever", service: "MOCK" };

describe("basic functionality", () => {
  let root;
  let content;
  beforeEach(() => {
    const { root: preppedRoot, content: preppedContent } = prepDocument();
    root = preppedRoot;
    content = preppedContent;
  });

  afterEach(() => {
    document.body.removeChild(root);
    document.body.removeChild(content);
  });

  let card;

  const bootstrap = (settings = {}) => {
    root.setAttribute("data-settings", JSON.stringify(settings));
    GMS.bootstrap();
    card = get(root, "gms-modal-card");
    expect(card.innerHTML).toEqual("");
  };

  const clickTriggerButton = (settings = {}) => {
    const button = get(document, "gms-button");
    button.setAttribute("data-settings", JSON.stringify(settings));
    userEvent.click(button);
  };

  const cardContent =
    (elName) =>
    (selector, index = 0) => {
      const el = get(card, `gms-modal-${elName}`);
      return selector ? get(el, selector, index) : el;
    };

  const body = cardContent("body");
  const header = cardContent("header");
  const actions = cardContent("actions");

  const expectToChangeStage = (action, newStage) => {
    const spy = jest.spyOn(gms, "updateState");
    expect(spy).not.toHaveBeenCalled();
    action();
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].stage).toEqual(newStage);
    spy.mockRestore();
  };

  describe("modal triggering", () => {
    it("without to setting globally - renders error modal", () => {
      bootstrap({});
      clickTriggerButton();
      expect(card.innerHTML.includes("Something went wrong!")).toBeTruthy();
    });

    describe("with a to setting globally", () => {
      it("renders amount input card", () => {
        bootstrap({ to: "whomever" });
        clickTriggerButton();
        expect(card.innerHTML.includes("Something went wrong!")).toBeFalsy();
        const input = get(card, "gms-amount-input");
        expect(input).toBeTruthy();
      });
    });

    describe("with a to setting on the button instead", () => {
      it("renders amount input card", () => {
        bootstrap();
        clickTriggerButton({ to: "whomever" });
        expect(card.innerHTML.includes("Something went wrong!")).toBeFalsy();
        const input = get(card, "gms-amount-input");
        expect(input).toBeTruthy();
      });
    });
  });

  describe("stages", () => {
    beforeEach(() => {
      bootstrap(baseSettings);
    });
    describe("AMOUNT_INPUT card", () => {
      it("renders an amount input, with appropriate button states", () => {
        clickTriggerButton();
        const amountInput = get(card, "gms-amount-input");
        expect(amountInput).toBeTruthy();

        // Filling in amount
        const amountNext = get(card, "gms-button");
        const amountBack = get(card, "gms-button", 1);
        expect(amountBack.innerHTML).toEqual("Cancel");
        expect(amountNext.innerHTML).toEqual("Next");
        expect(amountNext.disabled).toEqual(true);

        jest.spyOn(gms, "updateState");
        userEvent.click(amountNext);
        expect(gms.updateState).not.toHaveBeenCalled();

        userEvent.type(amountInput, "{backspace}{backspace}{backspace}1");
        expect(amountInput.value).toEqual("1.00");
        expect(amountNext.disabled).toEqual(false);

        expectToChangeStage(() => {
          userEvent.click(amountNext);
        }, "NOTE_INPUT");
      });
    });

    describe("NOTE_INPUT card", () => {
      it("renders a note input, with appropriate button states", () => {
        gms.trigger({}, { stage: "NOTE_INPUT", amount: 1 });

        const textarea = get(card, "textarea");
        expect(textarea).toBeTruthy();

        // Note input
        const noteNext = get(card, "gms-button", 0);
        expect(noteNext.innerHTML).toEqual("Get invoice");

        // Note not mandatory
        expect(noteNext.disabled).toEqual(false);
        userEvent.type(textarea, "Test note");

        jest.spyOn(InvoiceHelper, "getInvoiceAndPoll");
        expectToChangeStage(() => {
          userEvent.click(noteNext);
        }, "LOADING");

        expect(InvoiceHelper.getInvoiceAndPoll).toHaveBeenCalledWith({
          to: "whomever",
          amount: 1,
          note: "Test note",
        });
      });

      it("allows for going back and forward", () => {
        gms.trigger({}, { stage: "NOTE_INPUT", amount: 1 });
        const noteBack = get(card, "gms-button", 1);
        expect(noteBack.innerHTML).toEqual("Back");

        userEvent.click(noteBack);

        // Back on Amount page
        expect(get(card, "textarea")).toBeFalsy();
        expect(get(card, "input")).toBeTruthy();
        const amountNext = get(card, "gms-button");
        userEvent.click(amountNext);

        // Back on Note page
        expect(get(card, "textarea")).toBeTruthy();
        expect(get(card, "input")).toBeFalsy();
      });
    });

    describe("INVOICE card", () => {
      let invoice;

      beforeEach(() => {
        invoice = {
          secondsLeft: 30,
          lnInvoice: "abc",
        };
      });

      it("displays an invoice, given an invoice", () => {
        gms.trigger(
          {},
          { stage: "INVOICE", amount: 1, note: "Test note", invoice }
        );

        expect(get(card, "canvas")).toBeTruthy();

        expect(header("h1").innerHTML).toEqual(baseSettings.to);
        expect(header("h2").innerHTML).toEqual("$1.00");
        expect(header("p").innerHTML).toEqual("Test note");

        expect(body("p").innerHTML).toEqual("Expires in 30s");

        expect(actions("button", 0).innerHTML).toEqual("Copy");
        expect(actions("button", 1).innerHTML).toEqual("Back");
      });

      it("displays an error modal if no invoice is provided", () => {
        gms.trigger({}, { stage: "INVOICE", amount: 1, note: "Test note" });
        expect(get(card, "canvas")).toBeFalsy();
        expect(get(card, "h3").innerHTML).toEqual("Something went wrong!");
      });

      it("displays expired state if stage is EXPIRED", () => {
        gms.trigger(
          {},
          { stage: "EXPIRED", amount: 1, note: "Test note", invoice }
        );

        expect(get(card, "gms-qr__expired")).toBeTruthy();

        expect(body("p").innerHTML).toEqual("Expired");
        expect(actions("button").innerHTML).toEqual("Refresh");
      });

      it("displays expired state if secondsLeft are 0 or below", () => {
        invoice.secondsLeft = 0;
        gms.trigger(
          {},
          { stage: "INVOICE", amount: 1, note: "Test note", invoice }
        );

        expect(get(card, "gms-qr__expired")).toBeTruthy();

        expect(body("p").innerHTML).toEqual("Expired");
        expect(actions("button").innerHTML).toEqual("Refresh");
      });
    });

    describe("PAID card", () => {
      const state = { stage: "PAID", amount: 1, note: "Test note" };
      it("renders a payment confirmation, and tip button by default", () => {
        gms.trigger({}, state);

        expect(header("h1").innerHTML).toEqual("Invoice paid!");
        expect(header("h3").innerHTML).toEqual("$1.00");

        // Success animation
        expect(body("svg")).toBeTruthy();

        expect(actions("button", 0).innerHTML).toEqual("Leave a Tip?");
        expect(actions("button", 1).innerHTML).toEqual("Done");

        expectToChangeStage(() => {
          userEvent.click(actions("button", 0));
        }, "LOADING");
      });

      it("shows no tip button if that setting is false", () => {
        gms.trigger({ suggestTip: false }, state);
        expect(header("h1").innerHTML).toEqual("Invoice paid!");

        expect(actions("button", 0).innerHTML).toEqual("Done");
        expect(actions("button", 1)).toEqual(undefined);
      });
    });

    describe("TIP_INVOICE card", () => {
      it("renders an invoice with precalculated note and amount", () => {
        gms.trigger(
          {},
          {
            stage: "TIP_INVOICE",
            amount: 10,
            tipInvoice: { lnInvoice: "hello", secondsLeft: 30 },
          }
        );

        expect(header("h1").innerHTML).toEqual("GimmeSats Devs");
        expect(header("h2").innerHTML).toEqual("$0.50");
        expect(header("p").innerHTML).toEqual(
          "0.05% of charge (or 1 cent min)."
        );
      });

      it("mins out at 1 cent", () => {
        gms.trigger(
          {},
          {
            stage: "TIP_INVOICE",
            amount: 0.1,
            tipInvoice: { lnInvoice: "hello", secondsLeft: 30 },
          }
        );

        expect(header("h1").innerHTML).toEqual("GimmeSats Devs");
        expect(header("h2").innerHTML).toEqual("$0.01");
        expect(header("p").innerHTML).toEqual(
          "0.05% of charge (or 1 cent min)."
        );
      });
    });
  });
});
