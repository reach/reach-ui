/**
 * Measure the current window dimensions.
 *
 * @see Docs   https://reach.tech/window-size
 * @see Source https://github.com/reach/reach-ui/tree/main/packages/window-size
 */

import * as React from "react";
import PropTypes from "prop-types";
import { canUseDOM, useIsomorphicLayoutEffect } from "@reach/utils";

////////////////////////////////////////////////////////////////////////////////

/**
 * WindowSize
 *
 * @see Docs https://reach.tech/window-size#windowsize
 * @param props
 */
export const WindowSize: React.FC<WindowSizeProps> = ({ children }) => {
  const dimensions = useWindowSize();
  return children(dimensions);
};

/**
 * @see Docs https://reach.tech/window-size#windowsize-props
 */
export type WindowSizeProps = {
  /**
   * A function that calls back to you with the window size.
   *
   * @see Docs https://reach.tech/window-size#windowsize-children
   */
  children: (size: {
    width: number;
    height: number;
  }) => React.ReactElement<any, any>;
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
 * @see Docs https://reach.tech/window-size#usewindowsize
 */
export function useWindowSize() {
  let { current: hasWindow } = React.useRef(canUseDOM());
  const [dimensions, setDimensions] = React.useState({
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

// TODO: Remove in 1.0
export type TWindowSize = {
  width: number;
  height: number;
};
