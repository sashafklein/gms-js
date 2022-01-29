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

  api(service) {
    return API(service || gms.settings().service);
  }

  updateState(newState, spotOptions) {
    this.debug({ newState });

    this.state = { ...this.state, ...newState };

    this.log(`${spotOptions ? "SPOT" : "FULL"} RENDER`);
    if (spotOptions) {
      this._spotRender(spotOptions);
    } else {
      this._fullRender();
    }
  }

  close() {
    this.log("CLOSING");
    this._localSettings = {};
    this.state = {};
    this._fullRender();
    this._clearThemeClasses();
  }

  nextStage() {
    this.log("MOVING TO NEXT STAGE");
    const next = stages[stages.indexOf(this.state.stage) + 1];
    return next;
  }

  prevStage() {
    this.log("MOVING TO PREV STAGE");
    const prev = stages[stages.indexOf(this.state.stage) - 1];
    return prev;
  }

  trigger = (
    triggerSettings = {},
    triggerState = { stage: "AMOUNT_INPUT" }
  ) => {
    this.log("TRIGGERING", { triggerSettings, triggerState });

    const settings = {
      ...this._globalSettings,
      ...triggerSettings,
    };

    if (settings.amountFixed) {
      triggerState.amount = settings.amount;
    }

    triggerState.note = settings.note || "Tip";

    this._localSettings = triggerSettings;
    this.state = triggerState;

    this._applyClasses();

    this._fullRender();
  };

  _fullRender() {
    const { stage } = this.state;

    try {
      this.root.onclick = undefined;

      this.log("RENDERING", this.settings(), this.state);

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
        ERROR: ErrorCard,
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

  debug(additions = {}) {
    if (this.isLocal) {
      window.gmsDebug = {
        settings: this.settings(),
        globalSeettings: this._globalSettings,
        localSettings: this._localSettings,
        state: this.state,
        ...additions,
      };
    }
  }

  _spotRender(instructions) {
    const { selector, innerHTML } = instructions;

    if (!selector || !innerHTML) {
      throw new Error(
        `GimmeSats -- Spot render called without selector or innerHTML.`
      );
    }

    const element = this._select(selector);
    element.innerHTML = innerHTML;
  }

  _select(selector) {
    if (selector[0] === ".") {
      return this.card.getElementsByClassName(selector.slice(1))[0];
    } else if (selector[0] === "#") {
      return this.card.getElementById(selector.slice(1));
    } else {
      throw new Error(`GimmeSats -- Bad selector. Must begin with . or #.`);
    }
  }

  log(...args) {
    if (this.isLocal) {
      console.info(...args);
    }
  }

  _clearThemeClasses() {
    this.log("CLEARING CLASS THEMES");
    const classes = this.card.className
      .split(" ")
      .filter((c) => !c.includes("theme"));

    this.card.className = classes.join(" ");
  }

  _applyClasses() {
    this.log("APPLYING CLASSES");
    const darkThemes = ["dark-blue"];
    const lightThemes = ["white"];
    const themes = [...darkThemes, ...lightThemes];

    const { theme } = this.settings();

    if (!theme) {
      throw new Error(
        "GimmeSats -- Root element or triggering button require a valid theme."
      );
    }

    if (!themes.includes(theme)) {
      throw new Error(
        `GimmeSats -- Bad color theme: ${theme} is not one of ${themes.join(
          ", "
        )}.`
      );
    }

    const themeType = darkThemes.includes(theme) ? "dark" : "light";

    this.card.classList.add(`gms-theme--${theme}`);
    this.card.classList.add(`gms-theme--is-${themeType}`);
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
