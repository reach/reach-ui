/* eslint-disable jsx-a11y/accessible-emoji */
import "../styles.css";
import React from "react";
import Tooltip from "../src/index";

export const name = "Custom Position";

const centered = (triggerRect, tooltipRect) => {
  const triggerCenter = triggerRect.left + triggerRect.width / 2;
  const left = triggerCenter - tooltipRect.width / 2;
  const maxLeft = window.innerWidth - tooltipRect.width - 2;
  return {
    left: Math.min(Math.max(2, left), maxLeft) + window.scrollX,
    top: triggerRect.bottom + 8 + window.scrollY
  };
};

export function Example() {
  return (
    <div>
      <Tooltip label="Notifications" position={centered}>
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>🔔</span>
        </button>
      </Tooltip>
      <Tooltip label="Settings" position={centered}>
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>⚙️</span>
        </button>
      </Tooltip>

      <div style={{ float: "right" }}>
        <Tooltip
          label="Notifications"
          ariaLabel="3 Notifications"
          position={centered}
        >
          <button style={{ fontSize: 25 }}>
            <span>🔔</span>
            <span>3</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
