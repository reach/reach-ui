import React, { useRef, useState } from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription
} from "@reach/alert-dialog";

describe("rendering", () => {
  it("should open the dialog", () => {
    const { baseElement, asFragment, getByText } = render(<BasicAlertDialog />);
    expect(asFragment()).toMatchSnapshot();
    let openButton = getByText("Show Dialog");
    fireEvent.click(openButton);
    expect(baseElement).toMatchSnapshot();
  });
  it("should have the correct label", () => {
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

////////////////////////////////////////////////////////////////////////////////
function BasicAlertDialog() {
  const close = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      {showDialog && (
        <AlertDialog leastDestructiveRef={close} id="great-work">
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
