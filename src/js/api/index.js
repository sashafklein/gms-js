import Mock from "./Mock";
import Strike from "./Strike";

const APIs = {
  STRIKE: Strike,
  MOCK: Mock,
};

const API = (service = gms.settings.service) => {
  const ApiClass = APIs[service];
  if (!ApiClass) {
    throw new Error(`GimmeSats -- No such API service: ${service}`);
  }

  return new ApiClass();
};

export default API;
