import * as React from "react";
import { action } from "@storybook/addon-actions";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "No Tabbables";

function Example() {
  const [showDialog, setShowDialog] = React.useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog
        aria-label="Announcement"
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
        onFocus={action("Focused!")}
      >
        <h2>There are no tabbables here</h2>
        <p>Tab should focus the element itself</p>
      </Dialog>
    </div>
  );
}

Example.storyName = name;
export { Example };
