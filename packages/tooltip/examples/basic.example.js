/* eslint-disable jsx-a11y/accessible-emoji */
import "../styles.css";
import React from "react";
import Tooltip from "../src/index";

export const name = "Basic";

export function Example() {
  return (
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

      <div style={{ float: "right" }}>
        <Tooltip label="Notifications" ariaLabel="3 Notifications">
          <button style={{ fontSize: 25 }}>
            <span>🔔</span>
            <span>3</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
