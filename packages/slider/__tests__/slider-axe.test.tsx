import * as React from "react";
import { cleanup, render } from "@reach-internal/test/utils";
import { axe } from "vitest-axe";
import { Slider } from "@reach/slider";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("<Slider /> with axe", () => {
  describe("a11y", () => {
    it("Should not have ARIA violations", async () => {
      vi.useRealTimers();
      const { container } = render(<Slider aria-label="basic slider" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
