import React from "react";
import Rect from "../src/index";

export let name = "Basic";

export let Example = () => (
  <Rect>
    {({ ref, rect }) => (
      <div>
        <pre>{JSON.stringify(rect, null, 2)}</pre>
        <textarea>resize this</textarea>
        <span
          ref={ref}
          contentEditable
          dangerouslySetInnerHTML={{
            __html: "Observing my rect, I'm also editable"
          }}
          style={{
            display: "inline-block",
            padding: 10,
            margin: 10,
            border: "solid 1px",
            background: "#f0f0f0"
          }}
        />
      </div>
    )}
  </Rect>
);
