import React from "react";
import WindowSize from "@reach/window-size";

let name = "Basic";

function Example() {
  return (
    <WindowSize>
      {sizes => <pre>Window size: {JSON.stringify(sizes, null, 2)}</pre>}
    </WindowSize>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "WindowSize" };
