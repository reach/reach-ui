import React from "react";

let style = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  width: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  position: "absolute",

  // https://medium.com/@jessebeach/beware-smushed-off-screen-accessible-text-5952a4c2cbfe
  whiteSpace: "nowrap",
  wordWrap: "normal"
};

function VisuallyHidden(props) {
  return <span style={style} {...props} />;
}

VisuallyHidden.displayName = "VisuallyHidden";

export default VisuallyHidden;
