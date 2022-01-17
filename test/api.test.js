import "regenerator-runtime/runtime";

import BaseApi from "../src/js/api/base";
import Mock from "../src/js/api/Mock";
import Strike from "../src/js/api/Strike";
import GMS from "../src/js/load";

import { prepDocument } from "./helpers";

describe("API modules", () => {
  jest.mock("axios");

  describe("Strike API", () => {
    let strike;
    beforeEach(() => {
      strike = new Strike();
    });

    describe("getInvoice", () => {
      it("munges and returns axios response", async () => {
        const invoice = await strike.getInvoice({
          to: "whomever",
          amount: 9,
          note: "Hello there!",
        });

        expect(invoice).toEqual({
          btcInvoice: "onchain-address",
          invoiceId: "hello-there",
          lnInvoice: "ln-invoice",
          secondsLeft: 58,
        });
      });
    });

    describe("checkInvoice", () => {
      it("munges and returns axios response", async () => {
        const invoice = await strike.checkInvoice({
          invoiceId: "my-id",
        });

        // Mix of given invoice and axios mock
        expect(invoice).toEqual({
          invoiceId: "my-id",
          secondsLeft: 40 - BaseApi.secondsToExpireEarly,
          status: "LIVE",
        });
      });
    });
  });

  describe("API generation", () => {
    it("grabs the right API based on the service", () => {
      const { root } = prepDocument();

      root.setAttribute(
        "data-settings",
        JSON.stringify({ to: "whomever", service: "STRIKE" })
      );
      GMS.bootstrap();
      expect(gms.api()).toBeInstanceOf(Strike);

      root.setAttribute(
        "data-settings",
        JSON.stringify({ to: "whomever", service: "MOCK" })
      );
      GMS.bootstrap();
      expect(gms.api()).toBeInstanceOf(Mock);
    });
  });
});
