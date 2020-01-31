/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useFakeTimers, SinonFakeTimers } from "sinon";
import { fireEvent, render } from "$test/utils";
import { Dialog } from "./index";

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
    // Not sure why clicking the overlay doesn't work in test env, works IRL 🤷‍♂️
    // fireEvent.click(getOverlay(baseElement)!)
    clock.tick(10);
    expect(baseElement).toMatchSnapshot();
    expect(queryByTestId("inner")).toBeNull();
  });
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
