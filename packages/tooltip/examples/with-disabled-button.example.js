/* eslint-disable jsx-a11y/accessible-emoji */
import "../styles.css";
import React from "react";
import Tooltip from "../src/index";

export const name = "With Disabled Button";

export function Example() {
  return (
    <div>
      <Tooltip label="Oh oh oh, oh oh">
        <button style={{ fontSize: 25, pointerEvents: "all" }} disabled>
          Can't Touch This
        </button>
      </Tooltip>
    </div>
  );
}
