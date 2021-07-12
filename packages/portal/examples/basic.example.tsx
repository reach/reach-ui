import * as React from "react";
import Portal from "@reach/portal";

let name = "Basic (TS)";

function Example() {
  return (
    <div
      style={{
        height: 40,
        overflow: "auto",
      }}
    >
      <div style={{ border: "solid 5px", padding: 20, marginLeft: 170 }}>
        This is in the normal react root, with an overflow hidden parent, clips
        the box.
      </div>
      <Portal>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 20,
            width: 100,
            border: "solid 5px",
            padding: 20,
            background: "#f0f0f0",
          }}
        >
          This is in the portal, rendered in the DOM at the document root so the
          CSS doesn't screw things up, but we render it in the react hierarchy
          where it makes sense.
        </div>
      </Portal>
    </div>
  );
}

Example.storyName = name;
export { Example };
