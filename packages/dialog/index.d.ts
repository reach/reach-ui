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

declare const Dialog: React.FunctionComponent<DialogProps>;

declare const DialogOverlay: React.FunctionComponent<DialogOverlayProps>;

declare const DialogContent: React.FunctionComponent<DialogContentProps>;
