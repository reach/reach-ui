import * as React from "react";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

let name = "With Disabled Button";

function Example() {
  return (
    <div>
      <Tooltip label="Oh oh oh, oh oh">
        <button style={{ fontSize: 25, pointerEvents: "all" }} disabled>
          <span aria-hidden>💾</span> Can't Touch This
        </button>
      </Tooltip>
      <Tooltip label="Oh oh oh, oh oh">
        <button style={{ fontSize: 25, pointerEvents: "all" }} disabled>
          <span aria-hidden>🔔</span>
        </button>
      </Tooltip>
      <Tooltip label="Oh oh oh, oh oh">
        <button style={{ fontSize: 25, pointerEvents: "all" }} disabled>
          <span aria-hidden>⚙️</span>
        </button>
      </Tooltip>
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Tooltip" };
