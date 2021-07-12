import * as React from "react";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "Dismiss";

function Example() {
  const [showDialog, setShowDialog] = React.useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog
        aria-label="Announcement"
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
      >
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
        <p>This is killer!</p>
        <input type="text" />
        <br />
        <input type="text" />
        <button>Ayyyyyy</button>
      </Dialog>
    </div>
  );
}

Example.storyName = name;
export { Example };
