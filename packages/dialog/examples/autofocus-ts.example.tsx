import * as React from "react";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "Autofocus (TS)";

function Example() {
  const [showDialog, setShowDialog] = React.useState(false);
  const button = React.useRef(null);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog
        aria-label="Announcement"
        isOpen={showDialog}
        initialFocusRef={button}
      >
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
        <button ref={button}>Auto focused</button>
      </Dialog>
    </div>
  );
}

Example.storyName = name;
export { Example };
