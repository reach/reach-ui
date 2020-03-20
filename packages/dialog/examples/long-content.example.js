import React, { useState } from "react";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "Long Content";

function Example() {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      {new Array(20).fill(1).map((x, index) => (
        <div
          key={index}
          style={{ position: "absolute", top: (index + 1) * 100 + "px" }}
        >
          - scroll -
        </div>
      ))}
      <Dialog
        aria-label="Announcement"
        isOpen={showDialog}
        onDismiss={() => setShowDialog(false)}
      >
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
        <p>Yikes!</p>
        <div style={{ height: 3000 }} />
        <button>Ayyyyyy</button>
      </Dialog>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Dialog" };
