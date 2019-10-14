import React from "react";
import { func } from "prop-types";

let hasWindow = typeof window !== "undefined";

const WindowSize = ({ children }) => {
  const [dimensions, setDimensions] = React.useState({
    width: hasWindow ? window.innerWidth : 0,
    height: hasWindow ? window.innerHeight : 0
  });
  React.useLayoutEffect(() => {
    const resize = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return children(dimensions);
};

if (__DEV__) {
  WindowSize.propTypes = {
    children: func.isRequired
  };
}

export default WindowSize;
