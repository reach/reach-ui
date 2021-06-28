import * as React from "react";
import { render } from "$test/utils";
import { axe } from "jest-axe";
import VisuallyHidden from "@reach/visually-hidden";

describe("<VisuallyHidden /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    jest.useRealTimers();
    const { container } = render(
      <button onClick={() => void null}>
        <VisuallyHidden>Click Me</VisuallyHidden>
        <span aria-hidden>👏</span>
      </button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
