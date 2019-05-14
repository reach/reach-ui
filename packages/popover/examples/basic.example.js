import React, { useRef, useState } from "react";
import Popover, { positionDefault, positionMatchWidth } from "../src/index";

export let name = "Basic";

export function Example() {
  const ref = useRef();
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
          position={
            value === "match width" ? positionMatchWidth : positionDefault
          }
          targetRef={ref}
        >
          <div
            style={{
              border: "solid 1px",
              padding: 10,
              background: "white"
            }}
          >
            <p>Huzzah!!! I am here! WASSUPPPPP</p>
            <p>What's going on?</p>
          </div>
        </Popover>
      )}
    </div>
  );
}
