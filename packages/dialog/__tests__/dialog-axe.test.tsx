import * as React from "react";
import { axe } from "jest-axe";
import { render, act } from "$test/utils";
import { AxeResults } from "$test/types";
import { Dialog } from "@reach/dialog";

describe("<Dialog /> with axe", () => {
  it("Should not have ARIA violations", async () => {
    jest.useRealTimers();
    const { container } = render(<BasicOpenDialog />);
    let results: AxeResults = null as any;
    await act(async () => {
      results = await axe(container);
    });
    expect(results).toHaveNoViolations();
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
