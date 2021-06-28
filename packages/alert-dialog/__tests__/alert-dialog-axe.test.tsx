import * as React from "react";
import { axe } from "jest-axe";
import { render, fireEvent, act } from "$test/utils";
import { AxeResults } from "$test/types";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
} from "@reach/alert-dialog";

describe("<AlertDialog /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    jest.useRealTimers();
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

////////////////////////////////////////////////////////////////////////////////

function BasicAlertDialog() {
  const close = React.useRef(null);
  const [showDialog, setShowDialog] = React.useState(false);
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
