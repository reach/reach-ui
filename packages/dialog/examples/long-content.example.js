import React from "react";
import "../styles.css";
import { Dialog } from "@reach/dialog";

export let name = "Long Content";

export let Example = () => {
  const [showDialog, setShowDialog] = React.useState(false);
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
      <Dialog accessibilityLabel="Announcement" isOpen={showDialog}>
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
        <p>Yikes!</p>
        <div style={{ height: 3000 }} />
        <button>Ayyyyyy</button>
      </Dialog>
    </div>
  );
};
