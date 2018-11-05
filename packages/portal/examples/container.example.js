import React from "react";
import Component from "@reach/component-component";
import Portal from "../src/index";

export let name = "Specific container";

export let Example = () => (
  <Component getRefs={() => ({ container: React.createRef() })}>
    {({ refs }) => (
      <React.Fragment>
        <div
          ref={refs.container}
          style={{
            position: "absolute",
            top: 0,
            left: 20,
            width: 100,
            border: "solid 5px",
            padding: 20,
            background: "#f0f0f0"
          }}
        >
          This is a sibling DOM node to the tree where the portal component is
          rendered. We render the portal inside this container.
        </div>

        <div
          style={{
            height: 40,
            overflow: "auto"
          }}
        >
          <div style={{ border: "solid 5px", padding: 20, marginLeft: 170 }}>
            This is in the normal react root, with an overflow hidden parent,
            clips the box.
          </div>
          <Portal container={refs.container}>
            <div style={{ border: "solid 5px" }}>
              This is inside the portal, rendered in the DOM inside the given
              container element so the CSS doesn't screw things up, but we
              render it in the react hierarchy where it makes sense.
            </div>
          </Portal>
        </div>
      </React.Fragment>
    )}
  </Component>
);
