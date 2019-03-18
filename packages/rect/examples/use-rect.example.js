import React, { useRef } from "react";
import Rect, { useRect } from "../src/index";

export const name = "useRect";

export const Example = () => {
  const ref = useRef();
  const rect = useRect(ref);
  return (
    <div>
      <pre>{JSON.stringify(rect, null, 2)}</pre>
      <textarea defaultValue="resize this" />
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
  );
};
