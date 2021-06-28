import * as React from "react";
import { render, act, fireEvent } from "$test/utils";
import { axe } from "jest-axe";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";

describe("<Disclosure /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    jest.useRealTimers();
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
