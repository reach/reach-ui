/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

let name = "Fullscreen (TS)";

function Example() {
  const containerRef = React.useRef(null);
  return (
    <div>
      <div
        ref={containerRef}
        style={{
          margin: "50px",
          background: "blue",
          width: "100px",
          height: "100px",
        }}
      >
        hello
        <button
          onClick={
            // @ts-expect-error
            () => containerRef.current.requestFullscreen()
          }
        >
          fullscreen
        </button>
        <Tooltip
          label="Notifications"
          aria-label="3 Notifications"
          // @ts-expect-error
          containerRef={containerRef}
        >
          <button style={{ fontSize: 25 }}>
            <span>🔔</span>
            <span>3</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

Example.storyName = name;
export { Example };
