import * as React from "react";
import { useRect } from "@reach/rect";

let name = "Change the observed ref";

function Example() {
  let refLeft = React.useRef<HTMLTextAreaElement>(null);
  let refRight = React.useRef<HTMLTextAreaElement>(null);
  let [whichRect, setWhichRect] = React.useState(true);
  let rect = useRect(whichRect ? refLeft : refRight);
  return (
    <div>
      <pre>
        {whichRect ? "left" : "right"}: {JSON.stringify(rect, null, 2)}
      </pre>
      <button onClick={() => setWhichRect(!whichRect)}>
        Toggle Observed Ref
      </button>
      <div>
        <textarea ref={refLeft} defaultValue="resize this" />
        <textarea ref={refRight} defaultValue="resize this" />
      </div>
    </div>
  );
}

Example.storyName = name;
export { Example };
