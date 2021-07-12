import * as React from "react";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "Autofocus";

function Example() {
  // This is to force an update. Verifying that updates don't mess around with
  // react focus lock.
  // https://github.com/reach/reach-ui/issues/396
  const [, forceUpdate] = React.useState(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const button = React.useRef(null);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog
        aria-label="Announcement"
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
        initialFocusRef={button}
      >
        <h3>Tab Around!</h3>
        <div>
          <input
            defaultValue="Just a boring field!"
            onBlur={() => forceUpdate({})}
          />
        </div>
        <div>
          <input
            defaultValue="Nothing to see here!"
            onBlur={() => forceUpdate({})}
          />
        </div>
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
        <button ref={button}>I'm focused first</button>
      </Dialog>
    </div>
  );
}

Example.storyName = name;
export { Example };
