import { defaults, stages } from "./helpers";
import amountInput from "./cards/amountInput";
import noteInput from "./cards/noteInput";

class GMS {
  static requiredSettings = ["to", "service"];

  constructor(root, card, globalSettings) {
    this.root = root;
    this.card = card;
    this.invoice = {};
    this._globalSettings = {
      ...defaults,
      ...globalSettings,
    };
    this.settings = {};
  }

  render() {
    console.log("RENDERING", this.settings);
    const show = !!this.settings.stage;

    if (show) {
      this.root.classList.add("gms--show");
    } else {
      this.root.classList.remove("gms--show");
    }

    if (!show) {
      return;
    }

    const contentFunction = {
      AMOUNT_INPUT: amountInput,
      NOTE_INPUT: noteInput,
    }[this.settings.stage];

    if (contentFunction) {
      const cardChild = contentFunction(this.settings);
      this.card.innerHTML = "";
      this.card.prepend(cardChild);
    } else {
      throw new Error(
        `GimmeSats -- No content function found for stage: ${this.settings.stage}.`
      );
    }
  }

  update(newSettings, overwrite = false) {
    this.settings = overwrite
      ? newSettings
      : { ...this.settings, ...newSettings };
    this.render();
  }

  close() {
    this.update({}, true);
  }

  nextStage() {
    return stages[stages.indexOf(this.settings.stage) + 1];
  }

  prevStage() {
    return stages[stages.indexOf(this.settings.stage) + 1];
  }

  trigger = (triggerSettings = {}) => {
    const settings = {
      ...this._globalSettings,
      ...triggerSettings,
      stage: "AMOUNT_INPUT",
    };

    const missing = GMS.requiredSettings.filter((key) => !settings[key]);

    if (missing.length) {
      throw new Error(
        `GimmeSats -- Missing required settings: '${missing.join("', '")}'`
      );
    }

    this.update(settings, true);
  };
}

export default GMS;
