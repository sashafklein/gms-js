import { isDescendant, defaults, stages } from "./helpers/utils";
import AmountInput from "./cards/AmountInput";
import NoteInput from "./cards/NoteInput";
import Invoice from "./cards/Invoice";
import API from "./api/index";
import ErrorCard from "./cards/ErrorCard";
import Paid from "./cards/Paid";
import Loader from "./cards/Loader";

class GMS {
  isLocal = window.location.href.includes("localhost:3000");

  requiredSettings = ["to", "service"];
  expiryInterval;

  tipPercentage = 0.05;
  tipMin = 0.01; // Cents
  tipService = process.env.NODE_ENV === "test" ? "MOCK" : "STRIKE";
  tipTo = "sasha";
  tipDisplayName = "GimmeSats Devs";
  tipNote = `${this.tipPercentage}% of charge (or 1 cent min).`;

  constructor(root, globalSettings) {
    this.root = root;
    this.card = root.getElementsByClassName("gms-modal-card")[0];
    this._globalSettings = {
      ...defaults,
      ...globalSettings,
    };
    this._localSettings = {};
    this.state = {};
  }

  settings() {
    return {
      ...this._globalSettings,
      ...this._localSettings,
    };
  }

  render() {
    const { stage } = this.state;
    try {
      this.root.onclick = undefined;

      if (this.isLocal) {
        console.log("RENDERING", this.settings(), this.state);
      }

      const show = !!stage;

      if (show) {
        this.root.classList.add("gms--show");
      } else {
        this.root.classList.remove("gms--show");
      }

      if (!show) {
        return;
      }
    } catch (err) {
      if (this.isLocal) {
        console.error(err);
      }
      return;
    }

    try {
      const Card = {
        AMOUNT_INPUT: AmountInput,
        NOTE_INPUT: NoteInput,
        INVOICE: Invoice,
        EXPIRED: Invoice,
        TIP_INVOICE: Invoice,
        PAID: Paid,
        LOADING: Loader,
      }[stage];

      if (!Card) {
        throw new Error(
          `GimmeSats -- No content function found for stage: ${stage}.`
        );
      }

      this._setCard(Card);
    } catch (err) {
      if (this.isLocal) {
        console.error(err);
      }
      this._setCard(ErrorCard);
    }
  }

  api(service) {
    return API(service || gms.settings().service);
  }

  updateState(newState, overwrite = false) {
    this.state = overwrite ? newState : { ...this.state, ...newState };
    this.render();
  }

  close() {
    this._localSettings = {};
    this.state = {};
    this.render();
  }

  nextStage() {
    const next = stages[stages.indexOf(this.state.stage) + 1];
    return next;
  }

  prevStage() {
    const prev = stages[stages.indexOf(this.state.stage) - 1];
    return prev;
  }

  trigger = (
    triggerSettings = {},
    triggerState = { stage: "AMOUNT_INPUT" }
  ) => {
    const settings = {
      ...this._globalSettings,
      ...triggerSettings,
    };

    if (settings.amountFixed) {
      triggerState.amount = settings.amount;
    }

    if (settings.noteFixed) {
      triggerState.note = settings.note;
    }

    this._localSettings = triggerSettings;
    this.state = triggerState;

    this.render();
  };

  receiveInvoice(invoice) {
    this.state.invoice = invoice;
    this.expiryInterval = setInterval(() => {
      const api = new API();
      api.checkForPaymentAndUpdateApp();
      this.state.invoice.expirySeconds -= 1;
      if (this.state.invoice.expirySeconds <= 0) {
        clearInterval(this.expiryInterval);
      }
      this.render();
    }, 1000);
  }

  _setCard(card) {
    this.card.innerHTML = "";
    this.card.prepend(card());
    this._closeModalOnClick();
  }

  _closeModalOnClick() {
    setTimeout(() => {
      this.root.onclick = (event) => {
        if (!isDescendant(event.target, "gms-modal-card")) {
          this.close();
        }
      };
    }, 100);
  }
}

export default GMS;
