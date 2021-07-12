import * as React from "react";
import { useRect } from "@reach/rect";

let name = "Basic (useRect)";

function Example() {
  const ref = React.useRef();
  const rect = useRect(ref, { observe: true });
  return (
    <div>
      <pre>{JSON.stringify(rect, null, 2)}</pre>
      <textarea defaultValue="resize this" />
      <span
        ref={ref}
        contentEditable
        dangerouslySetInnerHTML={{
          __html: "Observing my rect, I'm also editable",
        }}
        style={{
          display: "inline-block",
          padding: 10,
          margin: 10,
          border: "solid 1px",
          background: "#f0f0f0",
        }}
      />
    </div>
  );
}

Example.storyName = name;
export { Example };
