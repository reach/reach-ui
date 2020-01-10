// import { checkStyles } from "@reach/utils";

beforeEach(() => {
  jest.unmock("@reach/utils");
  const utils = require("@reach/utils");
  utils.checkStyles = jest.fn();
});

afterEach(() => {
  //
});
