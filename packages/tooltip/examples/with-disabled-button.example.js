import React from "react";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

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
