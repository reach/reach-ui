import * as React from "react";
import { cleanup, render, act, fireEvent } from "@reach-internal/test/utils";
import { axe } from "vitest-axe";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("<Disclosure /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    vi.useRealTimers();
    let { getByRole, container } = render(
      <Disclosure>
        <DisclosureButton>Click Button</DisclosureButton>
        <DisclosurePanel>Panel body</DisclosurePanel>
      </Disclosure>
    );
    let results = await axe(container);
    expect(results).toHaveNoViolations();

    act(() => void fireEvent.click(getByRole("button")));
    let newResults = await axe(container);
    expect(newResults).toHaveNoViolations();
  });
});
