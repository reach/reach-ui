import React, { useState } from "react";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

let name = "Nested";

function Example() {
  const [showDialog1, setShowDialog1] = useState(false);
  const [showDialog2, setShowDialog2] = useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog1(true)}>Show Dialog</button>
      <Dialog
        aria-label="Announcement"
        onDismiss={() => setShowDialog1(false)}
        isOpen={showDialog1}
      >
        <div>
          <button onClick={() => setShowDialog2(true)}>
            Show Another Dialog
          </button>
          <p>You can never have too many design escape hatches</p>
          <Dialog
            aria-label="A second announcement"
            style={{ position: "relative", left: 20, top: 20 }}
            onDismiss={() => setShowDialog2(false)}
            isOpen={showDialog2}
          >
            <button onClick={() => setShowDialog2(false)}>Close Dialog</button>
            <button>Just button</button>
            <p>Well, maybe you can</p>
          </Dialog>
        </div>
      </Dialog>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Dialog" };
