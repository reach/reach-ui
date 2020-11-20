import * as React from "react";
import { render } from "$test/utils";
import { axe } from "jest-axe";
import VisuallyHidden from "@reach/visually-hidden";

describe("<VisuallyHidden />", () => {
  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      const { container } = render(
        <button onClick={() => void null}>
          <VisuallyHidden>Click Me</VisuallyHidden>
          <span aria-hidden>👏</span>
        </button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("renders as any HTML element", async () => {
      const hiddenMessage = "Hidden Message";
      const { getByText } = render(
        <VisuallyHidden as="div">{hiddenMessage}</VisuallyHidden>
      );
      let visuallyHidden = getByText(hiddenMessage);
      expect(visuallyHidden.tagName).toBe("DIV");
    });
  });
});
