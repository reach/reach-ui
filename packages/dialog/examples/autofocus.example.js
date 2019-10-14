import React from "react";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "Autofocus";

export let Example = () => {
  const [showDialog, setShowDialog] = React.useState(false);
  const button = React.useRef(null);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog isOpen={showDialog} initialFocusRef={button}>
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
        <button ref={button}>Auto focused</button>
      </Dialog>
    </div>
  );
};
