import React from "react";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "Dismiss";

export let Example = () => {
  const [showDialog, setShowDialog] = React.useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog isOpen={showDialog} onDismiss={() => setShowDialog(false)}>
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
        <p>This is killer!</p>
        <input type="text" />
        <br />
        <input type="text" />
        <button>Ayyyyyy</button>
      </Dialog>
    </div>
  );
};
