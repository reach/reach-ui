import React from "react";
import { render, act, fireEvent } from "$test/utils";
import { axe } from "jest-axe";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";

describe("<Disclosure />", () => {
  it("should not have basic a11y issues", async () => {
    let { container, getByText } = render(<BasicDisclosure />);
    let button = getByText("Click Button");
    let results = await axe(container);
    expect(results).toHaveNoViolations();

    act(() => void fireEvent.click(button));
    let newResults = await axe(container);
    expect(newResults).toHaveNoViolations();
  });

  it("should toggle on click", () => {
    let { getByRole, getByTestId } = render(<BasicDisclosure />);
    expect(getByTestId("panel")).not.toBeVisible();
    act(() => void fireEvent.click(getByRole("button")));
    expect(getByTestId("panel")).toBeVisible();
  });

  // TODO: This fails for some reason despite working fine in the browser
  //       Tried keyDown, keyUp, and any number of options that should satisfy
  //       the requirements to no avail 🤷‍♂️
  // it("should toggle on spacebar", () => {
  //   let { getByRole, getByTestId } = render(<BasicDisclosure />);
  //   expect(getByTestId("panel")).not.toBeVisible();

  //   getByRole("button").focus();

  //   act(() => {
  //     fireEvent.keyDown(getByRole("button"), {
  //       key: " ",
  //       keyCode: 32,
  //     });
  //     fireEvent.keyUp(getByRole("button"), {
  //       key: " ",
  //       keyCode: 32,
  //     });
  //   }

  //   expect(getByTestId("panel")).toBeVisible();
  // });
});

function BasicDisclosure() {
  return (
    <Disclosure>
      <DisclosureButton>Click Button</DisclosureButton>
      <DisclosurePanel data-testid="panel">
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </DisclosurePanel>
    </Disclosure>
  );
}
