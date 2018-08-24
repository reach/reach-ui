import React from "react";

let style = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  width: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  position: "absolute"
};

// TODO: make a SkipNav component that appears when focus is received
// this component will never be visible so if it has natively focusable
// elements it will stay invisible.
export default ({ children }) => {
  return <div style={style} children={children} />
};
