import "@reach/tooltip/styles.css";

import React from "react";
import Tooltip from "@reach/tooltip";

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
