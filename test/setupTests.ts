// import { checkStyles } from "@reach/utils";
import "@testing-library/jest-dom/extend-expect";

beforeEach(() => {
  jest.unmock("@reach/utils");
  const utils = require("@reach/utils");
  utils.checkStyles = jest.fn();
});

afterEach(() => {
  //
});
