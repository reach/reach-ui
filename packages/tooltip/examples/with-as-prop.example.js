/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import ReachTooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";

let name = "As a span";

function Example() {
  const coolRef = React.useRef();
  return (
    <div>
      <Tooltip id="wow" label="Notifications">
        <button style={{ fontSize: 25 }} ref={coolRef}>
          <span aria-hidden>🔔</span>
        </button>
      </Tooltip>
      <Tooltip label="Settings">
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>⚙️</span>
        </button>
      </Tooltip>
      <Tooltip label="Your files are safe with us">
        <button style={{ fontSize: 25 }}>
          <span aria-hidden>💾</span> Save
        </button>
      </Tooltip>

      <div style={{ float: "right" }}>
        <Tooltip label="Notifications" aria-label="3 Notifications">
          <button style={{ fontSize: 25 }}>
            <span>🔔</span>
            <span>3</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

function Tooltip(props) {
  return <ReachTooltip style={{ display: "block" }} as="span" {...props} />;
}

Example.storyName = name;
export { Example };
