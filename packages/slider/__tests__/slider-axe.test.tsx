import * as React from "react";
import { render } from "$test/utils";
import { axe } from "jest-axe";
import {
  Slider,
  // SLIDER_HANDLE_ALIGN_CENTER,
  // SLIDER_HANDLE_ALIGN_CONTAIN,
  // SLIDER_ORIENTATION_HORIZONTAL,
  // SLIDER_ORIENTATION_VERTICAL
} from "@reach/slider";

describe("<Slider /> with axe", () => {
  describe("a11y", () => {
    it("Should not have ARIA violations", async () => {
      jest.useRealTimers();
      const { container } = render(<Slider aria-label="basic slider" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
