declare module "@reach/window-size" {
  import * as React from "react";

  export type WindowSize = {
    width: number;
    height: number;
  };

  export type WindowSizeProps = {
    children: (size: WindowSize) => React.ReactElement<any>;
  };

  export function useWindowSize(): WindowSize;

  declare const WindowSize: React.FunctionComponent<WindowSizeProps>;
  export default WindowSize;
}
