export default class BaseApi {
  static secondsToExpireEarly = 2;

  _path = (subpath) => [this._basePath(), subpath].join("/");

  _invoice = () => {
    return gms.state.invoice;
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
  getInvoice = (data = {}) => {
    this._implementError("getInvoice");
    return Promise.resolve(this._invoice());
  };

  // eslint-disable-next-line
  checkForPayment = (data = {}) => {
    this._implementError("checkForPayment");
    return Promise.resolve(this._invoice());
  };
}
