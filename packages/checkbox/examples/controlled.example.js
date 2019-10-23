/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { CustomCheckbox } from "@reach/checkbox";
import "@reach/checkbox/styles.css";

export const name = "Custom Controlled";

const smileyStyle = {
  display: "block",
  fontSize: 16,
  zIndex: 10,
  position: "absolute",
  lineHeight: 1,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none"
};

export function Example() {
  const [state, setState] = React.useState(false);
  return (
    <div>
      <CustomCheckbox
        id="whatever-input"
        value="whatever"
        checked={state}
        onChange={event => {
          const { checked } = event.target;
          setState(checked);
        }}
        checkmarks={{
          true: <span style={smileyStyle}>😃</span>,
          false: <span style={smileyStyle}>🙁</span>,
          mixed: <span style={smileyStyle}>🤐</span>
        }}
        style={{
          width: 20,
          height: 20
        }}
      />
      <label htmlFor="whatever-input">
        You can control the state WHATTTTTT
      </label>
      <button onClick={() => setState(!state)}>
        Toggle that checkbox baby
      </button>
      <button onClick={() => setState("mixed")}>Mix it up</button>
    </div>
  );
}
