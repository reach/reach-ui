declare module "@reach/popover" {
  import * as React from "react";

  export type Position = (
    targetRect: DOMRect,
    popoverRect: DOMRect
  ) => React.CSSProperties;

  export function positionDefault(
    targetRect: DOMRect,
    popoverRect: DOMRect
  ): { left: string; top: string };

  export function positionMatchWidth(
    targetRect: DOMRect,
    popoverRect: DOMRect
  ): { width: string; left: number; top: string };

  export type PopoverProps = {
    children: React.ReactNode;
    targetRef: React.RefObject<HTMLElement>;
    position?: Position;
  } & React.HTMLProps<HTMLDivElement>;

  declare const Popover: React.FunctionComponent<PopoverProps>;
  export default Popover;
}
