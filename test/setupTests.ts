// import { checkStyles } from "@reach/utils";
import "@testing-library/jest-dom/extend-expect";
import "jest-axe/extend-expect";

beforeEach(() => {
  jest.unmock("@reach/utils");
  jest.unmock("@reach/auto-id");
  jest.unmock("@reach/rect");
  const utils = require("@reach/utils");
  const autoId = require("@reach/auto-id");
  const rect = require("@reach/rect");
  utils.checkStyles = jest.fn();
  autoId.useId = (fallback: string) => fallback || "REACH-ID";
  rect.useRect = () => ({ height: 1, width: 1, x: 0, y: 0 });
});
