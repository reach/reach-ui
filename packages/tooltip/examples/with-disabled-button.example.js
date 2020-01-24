import React from "react";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

let name = "With Disabled Button";

function Example() {
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

Example.story = { name };
export const Comp = Example;
export default { title: "Tooltip" };
