const axios = jest.createMockFromModule("axios");

const post = (path) => {
  if (path.includes(`users/whomever/pay`)) {
    return Promise.resolve({
      data: {
        lnInvoice: "ln-invoice",
        expirySecond: 60,
        onchainAddress: "onchain-address",
        quoteId: "hello-there",
      },
    });
  }
};

const get = (path) => {
  if (path.includes("/receive/my-id")) {
    return Promise.resolve({
      data: {
        expirySecond: 40,
        result: "LIVE",
      },
    });
  }
};

axios.post = post;
axios.get = get;

module.exports = axios;
