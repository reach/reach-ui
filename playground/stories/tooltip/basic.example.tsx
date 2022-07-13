import * as React from "react";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

let name = "Basic";

function Example() {
  return (
    <div>
      <Tooltip id="wow" label="Notifications">
        <button style={{ fontSize: 25 }} aria-label="Notifications">
          <span aria-hidden>🔔</span>
        </button>
      </Tooltip>
      <Tooltip label="Settings">
        <button style={{ fontSize: 25 }} aria-label="Settings">
          <span aria-hidden>⚙️</span>
        </button>
      </Tooltip>
      <Tooltip label="Your files are safe with us">
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>💾</span> Save
        </button>
      </Tooltip>

      <div style={{ float: "right" }}>
        <Tooltip label="Notifications" aria-label="3 Notifications">
          <button style={{ fontSize: 25 }} aria-label="3 Notifications">
            <span aria-hidden>🔔</span>
            <span aria-hidden>3</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

Example.storyName = name;
export { Example };
