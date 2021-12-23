(function () {
  'use strict';

  const defaults = {
    service: "STRIKE",
    amount: 0,
    note: "",
  };

  const parseSettings = (element) => {
    const settingsString = element.getAttribute("data-settings") || "{}";

    let settings;
    try {
      settings = JSON.parse(settingsString);
    } catch (err) {
      throw new Error(
        `GimmeSats -- Failed to parse element settings. Make sure they are in JSON format.
          Element: ${element}
          Error: ${err}`
      );
    }

    return settings || {};
  };

  const stages = ["AMOUNT_INPUT", "NOTE_INPUT", "INVOICE", "PAID"];

  const isDescendant = (child, parentClass) => {
    let node = child.parentNode;
    while (node != null) {
      if (node.classList && node.classList.contains(parentClass)) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  const element = (klass, innerHTML = "", type = "div") => {
    const el = document.createElement(type);
    el.classList.add(klass);
    el.innerHTML = innerHTML;
    return el;
  };

  const actionGroup = (primary, secondary) => {
    let pri;
    let sec;

    const group = document.createElement("div");
    group.classList.add("gms-modal-actions");

    if (primary) {
      pri = document.createElement("button");
      pri.classList.add("gms-button");
      pri.classList.add("gms-button--med");
      pri.disabled = primary.disabled;
      pri.innerHTML = primary.text;
      pri.onclick = primary.onClick;
      group.append(pri);
    }

    if (secondary) {
      sec = document.createElement("button");
      sec.classList.add("gms-button");
      sec.classList.add("gms-button--light");
      sec.disabled = secondary.disabled;
      sec.innerHTML = secondary.text;
      sec.onclick = secondary.onClick;
      group.append(sec);
    }

    return group;
  };

  const modalContent = (headerContent, bodyContent, makeActionObjects) => {
    const content = element("gms-modal-content");
    const header = element("gms-modal-header", headerContent);
    const body = element("gms-modal-body", bodyContent);
    const actions = actionGroup(...makeActionObjects({ header, body }));

    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(actions);

    return { content, header, body, actions };
  };

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

  class BaseApi {
    static secondsToExpireEarly = 2;

    _path = (subpath) => [this._basePath(), subpath].join("/");

    _invoice = () => {
      return gms.invoice;
    };

    _settings = () => {
      return gms.settings;
    };

    _basePath = () => {
      this._implementError("basePath");
      return "";
    };

    _implementError = (methodName) => {
      throw new Error(
        `GimmeSats -- Not Implemented -- ${methodName} method must be defined in BaseApi subclasses.`
      );
    };

    // eslint-disable-next-line
    getInvoice = (overload) => {
      this._implementError("getInvoice");
      return Promise.resolve(this._invoice());
    };

    // eslint-disable-next-line
    checkForPayment = (overload) => {
      this._implementError("checkForPayment");
      return Promise.resolve(this._invoice());
    };
  }

  class Strike extends BaseApi {
    _basePath = () => "https://api.zaphq.io/api/v0.4/public";

    getInvoice = async () => {
      const settings = this._settings();
      const { to, note } = settings;
      const amount = settings.amount;
      const includeOnchainAddress = amount >= 10;
      const body = {
        description: note,
        includeOnchainAddress,
        amount: {
          currency: "USD",
          amount: amount.toFixed(2),
        },
      };

      console.log("BEFORE");
      const resp = await fetch(this._path(`users/${to}/pay`), {
        method: "POST",
        body: body,
      });
      console.log("AFTER", resp);
      const data = await resp.json();
      console.log("BOOYAH", data);

      return Promise.resolve({
        lnInvoice: data.lnInvoice,
        secondsLeft: data.expirySecond - BaseApi.secondsToExpireEarly,
        btcInvoice: data.onchainAddress,
        invoiceId: data.quoteId,
      });
    };

    checkForPayment = async () => {
      const resp = await fetch(
        this._path(`receive/${this._invoice().invoiceId}`)
      );
      const data = await resp.json();

      return Promise.resolve({
        ...this._invoice(),
        secondsLeft: data.expirySecond - BaseApi.secondsToExpireEarly,
        status: data.result === "PAID" ? "PAID" : undefined,
      });
    };
  }

  const APIs = {
    STRIKE: Strike,
  };

  class API {
    constructor() {
      this.api = API.getInstance();
    }

    getInvoiceAndUpdateApp = () => {
      gms.update({ stage: "LOADING" });
      return this.api.getInvoice().then((invoice) => {
        gms.invoice = invoice;
        gms.update({
          settings: { ...this.context.settings, stage: "INVOICE" },
        });
      });
    };

    checkForPaymentAndUpdateApp = () => {
      this.api.checkForPayment().then((invoice) => {
        let stage = gms.settings.stage;
        if (invoice.secondsLeft <= 0) {
          stage = "EXPIRED";
        }

        if (invoice.status === "PAID") {
          stage = "PAID";
        }

        this.invoice = invoice;
        this.update({ stage });
        // TODO: Fix this
        // this.actions.onPayment(newContext);
      });
    };

    static getInstance = () => {
      const { service } = gms.settings;

      const ApiClass = APIs[service];

      if (!ApiClass) {
        throw new Error(`GimmeSats -- No such API service: ${service}`);
      }

      const api = new ApiClass();

      return api;
    };
  }

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

  function setup (GMS) {
    const root = document.getElementById("gms-root");

    if (!root) {
      throw new Error("GimmeSats -- No element found with ID 'gms-root'.");
    }

    const globalSettings = parseSettings(root);

    const darkThemes = ["dark-blue"];
    const lightThemes = ["white"];
    const themes = [...darkThemes, ...lightThemes];
    const classes = [];

    root.classList.forEach((klass) => {
      classes.push(klass);
    });

    const theme = classes.filter(
      (klass) =>
        klass.includes("gms-theme--") && themes.includes(klass.split("--")[1])
    )[0];

    if (!theme) {
      throw new Error("GimmeSats -- Root element requires a theme.");
    }

    root.classList.add(
      `gms-theme--is-${
      darkThemes.includes(theme.split("--")[1]) ? "dark" : "light"
    }`
    );

    if (root.children.length > 1) {
      throw new Error(
        "GimmeSats -- Root element cannot have more than one child."
      );
    }

    const container = document.createElement("div");
    container.classList.add("gms-modal-window");

    const screen = document.createElement("div");
    screen.classList.add("gms-modal-screen");

    const card = document.createElement("div");
    card.classList.add("gms-modal-card");

    screen.prepend(card);
    container.prepend(screen);
    root.prepend(container);

    window.gms = new GMS(root, card, globalSettings);

    // If the click was not within the card, close the modal.
    const closeModal = (event) => {
      if (!isDescendant(event.target, "gms-modal-card")) {
        gms.close();
      }
    };

    screen.onclick = closeModal;

    const triggers = document.getElementsByClassName("gms-button");

    for (let i = 0; i < triggers.length; i++) {
      const trigger = triggers[i];
      const settings = parseSettings(trigger);

      trigger.onclick = () => {
        window.gms.trigger(settings);
      };
    }
  }

  window.onload = function () {
    setup(GMS);
  };

})();
