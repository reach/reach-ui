declare module "@reach/dialog" {
  import * as React from "react";

  export type DialogProps = {
    isOpen?: boolean;
    onDismiss?: () => void;
    children?: React.ReactNode;
  } & React.HTMLProps<HTMLDivElement>;

  export type DialogOverlayProps = {
    initialFocusRef?: React.RefObject<HTMLElement>;
  } & DialogProps;

  export type DialogContentProps = {
    children?: React.ReactNode;
  } & React.HTMLProps<HTMLDivElement>;

  export const Dialog: React.FunctionComponent<DialogProps>;
  export const DialogOverlay: React.FunctionComponent<DialogOverlayProps>;
  export const DialogContent: React.FunctionComponent<DialogContentProps>;
}
