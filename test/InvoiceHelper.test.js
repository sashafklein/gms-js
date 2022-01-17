import Mock from "../src/js/api/Mock";
import InvoiceHelper from "../src/js/helpers/InvoiceHelper";

describe(InvoiceHelper, () => {
  describe("pollForInvoice", () => {
    let apiMock;
    let apiSpy;
    let repollSpy;
    let stateSpy;

    beforeEach(() => {
      apiMock = new Mock();
      apiSpy = jest.spyOn(apiMock, "checkInvoice");
      repollSpy = jest.spyOn(InvoiceHelper, "_pollAgainInOneSecond");
      stateSpy = jest.fn();

      window.gms = {
        api: () => apiMock,
        state: {
          tipInvoice: false,
        },
        updateState: stateSpy,
      };
    });

    afterEach(() => {
      apiSpy.mockRestore();
      repollSpy.mockRestore();
      stateSpy.mockRestore();
    });

    it("polls for an invoice again if status is LIVE", (done) => {
      apiSpy.mockImplementation(() => Promise.resolve({ status: "LIVE" }));

      expect(apiMock.checkInvoice).not.toHaveBeenCalled();

      InvoiceHelper.pollForInvoice({ whatever: true });

      setTimeout(() => {
        expect(apiMock.checkInvoice).toHaveBeenCalled();
        expect(repollSpy).toHaveBeenCalled();
        expect(stateSpy).toHaveBeenCalledWith({
          invoice: { status: "LIVE" },
        });
        done();
      }, 0);
    });

    it("stops polling if status is EXPIRED", (done) => {
      apiSpy.mockImplementation(() => Promise.resolve({ status: "EXPIRED" }));

      expect(apiMock.checkInvoice).not.toHaveBeenCalled();

      InvoiceHelper.pollForInvoice({ whatever: true });

      setTimeout(() => {
        expect(apiMock.checkInvoice).toHaveBeenCalled();
        expect(repollSpy).not.toHaveBeenCalled();
        expect(stateSpy).toHaveBeenCalledWith({
          invoice: { status: "EXPIRED" },
          stage: "EXPIRED",
        });
        done();
      }, 0);
    });

    it("stops polling if status is PAID", (done) => {
      apiSpy.mockImplementation(() => Promise.resolve({ status: "PAID" }));

      expect(apiMock.checkInvoice).not.toHaveBeenCalled();

      InvoiceHelper.pollForInvoice({ whatever: true });

      setTimeout(() => {
        expect(apiMock.checkInvoice).toHaveBeenCalled();
        expect(repollSpy).not.toHaveBeenCalled();
        expect(stateSpy).toHaveBeenCalledWith({
          invoice: { status: "PAID" },
          stage: "PAID",
        });
        done();
      }, 0);
    });
  });

  describe("getInvoiceAndPoll", () => {
    let apiMock;
    let apiSpy;
    let stateSpy;
    let pollSpy;

    beforeEach(() => {
      apiMock = new Mock();
      apiSpy = jest.spyOn(apiMock, "getInvoice");
      pollSpy = jest.spyOn(InvoiceHelper, "pollForInvoice");
      stateSpy = jest.fn();

      apiSpy.mockImplementation(() => Promise.resolve({ doesnt: "matter" }));

      window.gms = {
        api: () => apiMock,
        state: {
          tipInvoice: false,
        },
        updateState: stateSpy,
      };
    });

    afterEach(() => {
      apiSpy.mockRestore();
      pollSpy.mockRestore();
      stateSpy.mockRestore();
    });

    it("calls get invoice, and then starts pollForInvoice with the response", (done) => {
      InvoiceHelper.getInvoiceAndPoll();
      setTimeout(() => {
        expect(apiSpy).toHaveBeenCalled();
        expect(stateSpy).toHaveBeenCalledWith({
          stage: "INVOICE",
          invoice: { doesnt: "matter" },
        });
        expect(pollSpy).toHaveBeenCalledWith({ doesnt: "matter" });
        done();
      }, 0);
    });
  });
});
