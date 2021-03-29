import "@testing-library/jest-dom/extend-expect";
import "jest-axe/extend-expect";
import { axe, toHaveNoViolations } from "jest-axe";
import { act } from "react-dom/test-utils";
import { AxeResults } from "./types";

expect.extend({
  /**
   * Wrapper for axe's `expect.toHaveNoViolations` to simplify individual test
   * implementation for most cases.
   *
   * @param received
   */
  async toHaveNoAxeViolations(received: Element) {
    const check = toHaveNoViolations.toHaveNoViolations.bind(this);
    let axeResults: AxeResults | null;
    await act(async () => {
      axeResults = await axe(received);
    });
    return check(axeResults!);
  },
});

beforeEach(() => {
  jest.unmock("@reach/auto-id");
  jest.unmock("@reach/rect");
  const autoId = require("@reach/auto-id");
  const rect = require("@reach/rect");
  autoId.useId = (fallback: string) => fallback || "REACH-ID";
  rect.useRect = () => ({ height: 1, width: 1, x: 0, y: 0 });
});
