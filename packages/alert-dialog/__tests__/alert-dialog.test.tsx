import React, { useRef, useState } from "react";
import { axe } from "jest-axe";
import { render, fireEvent, act } from "$test/utils";
import { AxeResults } from "$test/types";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
} from "@reach/alert-dialog";

describe("<AlertDialog />", () => {
  describe("rendering", () => {
    it("should render the correct labels", () => {
      const { baseElement, getByText } = render(<BasicAlertDialog />);
      let openButton = getByText("Show Dialog");
      fireEvent.click(openButton);
      let dialogLabel = baseElement.querySelector(
        "[data-reach-alert-dialog-label]"
      );
      let dialogElement = baseElement.querySelector(
        "[data-reach-alert-dialog-content]"
      );
      let dialogLabelId = dialogLabel?.id;
      expect(dialogElement).toHaveAttribute("aria-labelledby", dialogLabelId);
    });
  });

  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      let { container, getByText, getByTestId } = render(<BasicAlertDialog />);
      let results: AxeResults = null as any;
      await act(async () => {
        results = await axe(container);
      });
      expect(results).toHaveNoViolations();

      let newResults: AxeResults = null as any;
      act(() => void fireEvent.click(getByText("Show Dialog")));
      await act(async () => {
        newResults = await axe(getByTestId("dialog"));
      });
      expect(newResults).toHaveNoViolations();
    });
  });

  describe("user events", () => {
    it("should open the dialog when clicking the trigger", () => {
      let { getByTestId, getByText } = render(<BasicAlertDialog />);
      act(() => void fireEvent.click(getByText("Show Dialog")));
      expect(getByTestId("dialog")).toBeInTheDocument();
    });
  });
});

////////////////////////////////////////////////////////////////////////////////
function BasicAlertDialog() {
  const close = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      {showDialog && (
        <AlertDialog
          leastDestructiveRef={close}
          data-testid="dialog"
          id="great-work"
        >
          <AlertDialogLabel>Confirmation!</AlertDialogLabel>
          <AlertDialogDescription>
            Are you sure you want to have that milkshake?
          </AlertDialogDescription>
          <p>
            <button>Do nothing here</button>{" "}
            <button ref={close} onClick={() => setShowDialog(false)}>
              Cancel
            </button>
          </p>
        </AlertDialog>
      )}
    </div>
  );
}
