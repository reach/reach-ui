/**
 * Measure the current window dimensions.
 *
 * @see Docs   https://reacttraining.com/reach-ui/window-size
 * @see Source https://github.com/reach/reach-ui/tree/master/packages/window-size
 */

import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { canUseDOM, useIsomorphicLayoutEffect } from "@reach/utils";

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

if (__DEV__) {
  WindowSize.displayName = "WindowSize";
  WindowSize.propTypes = {
    children: PropTypes.func.isRequired,
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
  let { current: hasWindow } = useRef(canUseDOM());
  const [dimensions, setDimensions] = useState({
    width: hasWindow ? window.innerWidth : 0,
    height: hasWindow ? window.innerHeight : 0,
  });
  useIsomorphicLayoutEffect(() => {
    const resize = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
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
