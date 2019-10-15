declare module "@reach/alert-dialog" {
  import * as React from "react";

  import { DialogProps, DialogContentProps } from "@reach/dialog";

  export type AlertDialogProps = {
    isOpen?: boolean;
    onDismiss?: () => void;
    leastDestructiveRef: React.RefObject<HTMLElement>;
    children: React.ReactNode;
  } & DialogProps;

  export type AlertDialogContentProps = {
    children: React.ReactNode;
  } & DialogContentProps;

  export const AlertDialog: React.FunctionComponent<AlertDialogProps>;
  export const AlertDialogLabel: React.FunctionComponent<
    React.HTMLProps<HTMLDivElement>
  >;
  export const AlertDialogDescription: React.FunctionComponent<
    React.HTMLProps<HTMLDivElement>
  >;
  export const AlertDialogOverlay: React.FunctionComponent<AlertDialogProps>;
  export const AlertDialogContent: React.FunctionComponent<
    AlertDialogContentProps
  >;
}
