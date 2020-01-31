import React, { useState, useRef } from "react";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "Return Focus";

function Example() {
  const [showDialog, setShowDialog] = useState(true);
  const buttonRef = useRef();
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <button ref={buttonRef}>I will focus</button>
      <Dialog
        aria-label="Announcement"
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
        returnFocusRef={buttonRef}
      >
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
        <p>When you close me ...</p>
      </Dialog>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Dialog" };
