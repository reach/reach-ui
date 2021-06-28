import * as React from "react";
import { useFakeTimers, SinonFakeTimers } from "sinon";
import { fireEvent, render, act, userEvent } from "$test/utils";
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

  describe("rendering", () => {
    it("does not render children when not open", () => {
      const { queryByTestId } = render(
        <div data-testid="root">
          <Dialog isOpen={false} aria-label="cool dialog">
            <div data-testid="inner" />
          </Dialog>
        </div>
      );
      expect(queryByTestId("root")).toBeTruthy();
      expect(queryByTestId("inner")).toBeNull();
    });
  });

  describe("a11y", () => {
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
  });

  describe("user events", () => {
    it("closes the dialog", () => {
      const { getByText, queryByTestId } = render(<BasicOpenDialog />);

      expect(queryByTestId("inner")).toBeTruthy();
      fireEvent.click(getByText("Close Dialog"));

      clock.tick(10);
      expect(queryByTestId("inner")).toBeNull();
    });

    it("closes the dialog when overlay is clicked", () => {
      const { baseElement, queryByTestId } = render(<BasicOpenDialog />);
      act(() => {
        userEvent.click(getOverlay(baseElement) as Element);
      });
      expect(queryByTestId("inner")).toBeNull();
    });
  });
});

function BasicOpenDialog() {
  const [showDialog, setShowDialog] = React.useState(true);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog
        aria-label="Announcement"
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
      >
        <div data-testid="inner">
          <button onClick={() => setShowDialog(false)}>Close Dialog</button>
          <input data-testid="text" type="text" />
          <button data-testid="useless-button">Ayyyyyy</button>
        </div>
      </Dialog>
    </div>
  );
}
