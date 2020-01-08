/**
 * Measure the current window dimensions.
 *
 * @see Docs   https://reacttraining.com/reach-ui/window-size
 * @see Source https://github.com/reach/reach-ui/tree/master/packages/window-size
 */

import React, { useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";

let hasWindow = typeof window !== "undefined";

////////////////////////////////////////////////////////////////////////////////

/**
 * WindowSize
 *
 * @see Docs https://reacttraining.com/reach-ui/window-size#windowsize
 * @param props
 */
export const WindowSize: React.FC<WindowSizeProps> = ({ children }) => {
  const dimensions = useWindowSize();
  return children(dimensions);
};

/**
 * @see Docs https://reacttraining.com/reach-ui/window-size#windowsize-props
 */
export type WindowSizeProps = {
  /**
   * A function that calls back to you with the window size.
   *
   * @see Docs https://reacttraining.com/reach-ui/window-size#windowsize-children
   */
  children: (size: TWindowSize) => React.ReactElement<any>;
};

WindowSize.displayName = "WindowSize";
if (__DEV__) {
  WindowSize.propTypes = {
    children: PropTypes.func.isRequired
  };
}

export default WindowSize;

////////////////////////////////////////////////////////////////////////////////

/**
 * useWindowSize
 *
 * @see Docs https://reacttraining.com/reach-ui/window-size#usewindowsize
 */
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

////////////////////////////////////////////////////////////////////////////////
// Types

export type TWindowSize = {
  width: number;
  height: number;
};
