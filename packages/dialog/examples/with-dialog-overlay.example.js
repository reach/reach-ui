import "@reach/dialog/styles.css";

import React from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";

export let name = "With Separate Overlay";

export let Example = () => {
  const overlayRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <div>
      <button onClick={open}>Show Dialog</button>

      <DialogOverlay
        ref={overlayRef}
        style={{ background: "hsla(0, 100%, 100%, 0.9)" }}
        isOpen={showDialog}
        onDismiss={close}
      >
        <DialogContent
          ref={contentRef}
          style={{ boxShadow: "0px 10px 50px hsla(0, 0%, 0%, 0.33)" }}
        >
          <p>
            The overlay styles are a white fade instead of the default black
            fade.
          </p>
          <button onClick={close}>Very nice.</button>
        </DialogContent>
      </DialogOverlay>
    </div>
  );
};
