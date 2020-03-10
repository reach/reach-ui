/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useFakeTimers, SinonFakeTimers } from "sinon";
import { axe, toHaveNoViolations } from "jest-axe";
import { fireEvent, render, cleanup } from "$test/utils";
import { Dialog } from "@reach/dialog";

function getOverlay(container: Element) {
  return container.querySelector("[data-reach-dialog-overlay]");
}

describe("<Dialog />", () => {
  let clock: SinonFakeTimers;
  beforeEach(() => {
    clock = useFakeTimers();
  });
  afterEach(() => {
    clock.restore();
  });

  it("does not render children when not open", () => {
    const { baseElement, queryByTestId } = render(
      <div data-testid="root">
        <Dialog isOpen={false} aria-label="cool dialog">
          <div data-testid="inner" />
        </Dialog>
      </div>
    );
    expect(queryByTestId("root")).toBeTruthy();
    expect(queryByTestId("inner")).toBeNull();
    expect(baseElement).toMatchSnapshot();
  });

  it("closes the dialog", () => {
    const { baseElement, getByText, queryByTestId } = render(
      <BasicOpenDialog />
    );
    expect(baseElement).toMatchSnapshot();
    expect(queryByTestId("inner")).toBeTruthy();
    fireEvent.click(getByText("Close Dialog"));

    // TODO: Test overlay click, it should close the dialog
    // Not sure why clicking the overlay doesn't work in test env, works IRL 🤷‍♂️
    // fireEvent.click(getOverlay(baseElement)!)

    clock.tick(10);
    expect(baseElement).toMatchSnapshot();
    expect(queryByTestId("inner")).toBeNull();
  });

  it("can be labelled by another element", () => {
    const { getByRole } = render(
      <Dialog isOpen aria-labelledby="dialog-title">
        <h1 id="dialog-title">I am the title now</h1>
      </Dialog>
    );

    const dialog = getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
    const label = document.getElementById(
      dialog.getAttribute("aria-labelledby")!
    );
    expect(label).toHaveTextContent("I am the title now");
  });

  // it("should not have basic a11y issues", async () => {
  //   // This test is erroring right now, experimenting with axe-core + jest-axe
  //   // Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.Error:
  //   // TODO: Fix this and figure out how this thing is supposed to work bc it would be super useful!
  //   const { container } = render(<BasicOpenDialog />);
  //   const results = await axe(container);
  //   expect(results).toHaveNoViolations();
  // });
});

function BasicOpenDialog() {
  const [showDialog, setShowDialog] = useState(true);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog aria-label="Announcement" isOpen={showDialog}>
        <div data-testid="inner">
          <button onClick={() => setShowDialog(false)}>Close Dialog</button>
          <input data-testid="text" type="text" />
          <button data-testid="useless-button">Ayyyyyy</button>
        </div>
      </Dialog>
    </div>
  );
}
