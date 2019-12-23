/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from "react";
import { Dialog } from "@reach/dialog";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

export const name = "With Dialog";

export function Example() {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>

      <Dialog isOpen={showDialog}>
        <div>
          <Tooltip label="Notifications">
            <button style={{ fontSize: 25 }}>
              <span aria-hidden>🔔</span>
            </button>
          </Tooltip>
          <Tooltip label="Settings">
            <button style={{ fontSize: 25 }}>
              <span aria-hidden>⚙️</span>
            </button>
          </Tooltip>
          <Tooltip label="Your files are safe with us">
            <button style={{ fontSize: 25 }}>
              <span aria-hidden>💾</span> Save
            </button>
          </Tooltip>

          <div style={{ float: "right" }}>
            <Tooltip label="Notifications" ariaLabel="3 Notifications">
              <button style={{ fontSize: 25 }}>
                <span>🔔</span>
                <span>3</span>
              </button>
            </Tooltip>
          </div>
        </div>

        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
      </Dialog>
    </div>
  );
}
