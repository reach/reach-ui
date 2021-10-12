/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

let name = "Fullscreen using Portal containerRef (TS)";

function Example() {
  const containerRef = React.useRef(null);
  return (
    <div>
      <div
        ref={containerRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "50px auto",
          padding: "20px",
          background: "#ddd",
          width: "300px",
          height: "100px",
        }}
      >
        <Tooltip
          label="Enter Fullscreen"
          aria-label="Enter Fullscreen"
          // @ts-expect-error
          containerRef={containerRef}
        >
          <button
            onClick={
              // @ts-expect-error
              () => containerRef.current.requestFullscreen()
            }
          >
            Enter Fullscreen
          </button>
        </Tooltip>
        <Tooltip
          label="Exit Fullscreen"
          aria-label="Exit Fullscreen"
          containerRef={containerRef}
        >
          <button onClick={() => document.exitFullscreen()}>
            Exit Fullscreen
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

Example.storyName = name;
export { Example };
