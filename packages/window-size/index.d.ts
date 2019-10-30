/**
 * Measure the current window dimensions.
 *
 * @see Docs   https://reacttraining.com/reach-ui/window-size
 * @see Source https://github.com/reach/reach-ui/tree/master/packages/window-size
 */

import * as React from "react";

export type WindowSize = {
  width: number;
  height: number;
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
  children: (size: WindowSize) => React.ReactElement<any>;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/window-size#usewindowsize
 */
export function useWindowSize(): WindowSize;

/**
 * @see Docs https://reacttraining.com/reach-ui/window-size#windowsize
 */
declare const WindowSize: React.FunctionComponent<WindowSizeProps>;

export default WindowSize;
