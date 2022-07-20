/// <reference types="vitest-axe/extend-expect" />
/// <reference types="vitest-dom/extend-expect" />

import * as React from "react";
import { axe } from "vitest-axe";
import type { AxeCore } from "vitest-axe";
import { cleanup, render, fireEvent, act } from "@reach-internal/test/utils";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
} from "@reach/alert-dialog";
import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(cleanup);

describe("<AlertDialog /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    vi.useRealTimers();
    let { container, getByText, getByTestId } = render(<BasicAlertDialog />);
    let results: AxeCore.AxeResults = null as any;
    await act(async () => {
      results = await axe(container);
    });
    expect(results).toHaveNoViolations();

    let newResults: AxeCore.AxeResults = null as any;
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
