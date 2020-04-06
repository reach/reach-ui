/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useFakeTimers, SinonFakeTimers } from "sinon";
import { axe, toHaveNoViolations } from "jest-axe";
import { fireEvent, render, act, userEvent } from "$test/utils";
import { AxeResults } from "$test/types";
import { Dialog, DialogProps } from "@reach/dialog";

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
      const { baseElement, queryByTestId } = render(
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
    it("should not have basic a11y issues", async () => {
      clock.restore();
      const { container } = render(<BasicOpenDialog />);
      let results: AxeResults = null as any;
      await act(async () => {
        results = await axe(container);
      });
      expect(results).toHaveNoViolations();
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

    it("ARIA hides ancestors by default", async () => {
      const { findByTestId } = render(
        <>
          <div data-testid="sibling">Hidden</div>
          <BasicOpenDialog />
        </>
      );
      const sibling = await findByTestId("sibling");
      expect(isAriaHidden(sibling)).toBe(true);
    });

    it("ARIA hides ancestors when ariaHideAncestors is true", async () => {
      const { findByTestId } = render(
        <>
          <div data-testid="sibling">Hidden</div>
          <BasicOpenDialog ariaHideAncestors={true} />
        </>
      );
      const sibling = await findByTestId("sibling");
      expect(isAriaHidden(sibling)).toBe(true);
    });

    it("doesn't ARIA hide ancestors when ariaHideAncestors is false", async () => {
      const { findByTestId } = render(
        <>
          <div data-testid="sibling">Not hidden</div>
          <BasicOpenDialog ariaHideAncestors={false} />
        </>
      );
      const sibling = await findByTestId("sibling");
      expect(isAriaHidden(sibling)).toBe(false);
    });
  });

  describe("user events", () => {
    it("closes the dialog", () => {
      const { baseElement, getByText, queryByTestId } = render(
        <BasicOpenDialog />
      );

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

function BasicOpenDialog(props: DialogProps) {
  const [showDialog, setShowDialog] = useState(true);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog
        aria-label="Announcement"
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
        {...props}
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

/**
 * Checks the element and its ancestors for an aria-hidden attribute.
 * If an aria-hidden is found, we assume it is set to true, which should be a
 * reasonable assumption for the purposes of these tests.
 */
function isAriaHidden(el: HTMLElement | null) {
  while (el) {
    if (el.hasAttribute("aria-hidden")) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}
