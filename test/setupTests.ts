// import { checkStyles } from "@reach/utils";
import "@testing-library/jest-dom/extend-expect";
import "jest-axe/extend-expect";

beforeEach(() => {
  jest.unmock("@reach/utils");
  jest.unmock("@reach/auto-id");
  const utils = require("@reach/utils");
  const autoId = require("@reach/auto-id");
  utils.checkStyles = jest.fn();
  autoId.useId = (fallback: string) => fallback || "REACH-ID";
});
