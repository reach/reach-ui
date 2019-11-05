import React, { useState, useLayoutEffect } from "react";
import { func } from "prop-types";

let hasWindow = typeof window !== "undefined";

export const WindowSize = ({ children }) => {
  const dimensions = useWindowSize();
  return children(dimensions);
};

if (__DEV__) {
  WindowSize.propTypes = {
    children: func.isRequired
  };
}

export default WindowSize;

export function useWindowSize() {
  const [dimensions, setDimensions] = useState({
    width: hasWindow ? window.innerWidth : 0,
    height: hasWindow ? window.innerHeight : 0
  });
  useLayoutEffect(() => {
    const resize = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return dimensions;
}
