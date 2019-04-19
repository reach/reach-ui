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

export default props => {
  return <div style={style} {...props} />;
};
