import Strike from "./Strike";

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

export default API;
