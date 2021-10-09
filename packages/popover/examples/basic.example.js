import * as React from "react";
import Popover, { positionDefault, positionMatchWidth } from "@reach/popover";

let name = "Basic";

function Example() {
  const ref = React.useRef();
  const [value, setValue] = React.useState("");
  return (
    <div>
      <textarea placeholder="resize me to move stuff around" />
      <textarea
        placeholder="Try typing 'match width'"
        ref={ref}
        onChange={(event) => setValue(event.target.value)}
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
              maxWidth: 400,
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

Example.storyName = name;
export { Example };
