import React, { useRef, useState } from "react";
import Popover, { positionDefault, positionMatchWidth } from "@reach/popover";

export let name = "Basic (TS)";

export function Example() {
  const ref = useRef<any>(null);
  const [value, setValue] = useState("");
  return (
    <div>
      <textarea placeholder="resize me to move stuff around" />
      <textarea
        placeholder="Try typing 'match width'"
        ref={ref}
        onChange={event => setValue(event.target.value)}
      />

      {value.length > 0 && (
        <Popover
          targetRef={ref}
          position={
            value === "match width" ? positionMatchWidth : positionDefault
          }
        >
          <div
            style={{
              border: "solid 1px",
              padding: 10,
              background: "white",
              width: 400
            }}
          >
            <p>Huzzah!!! I am here! WASSUPPPPP</p>
            <p>
              Tab navigation from the textarea that triggered this should now
              move to the button below.
            </p>
            <button>I should be the next tab</button>
          </div>
        </Popover>
      )}
      <button>and then tab to me after that one</button>
    </div>
  );
}
