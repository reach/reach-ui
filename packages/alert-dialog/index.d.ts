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

declare const AlertDialog: React.FunctionComponent<AlertDialogProps>;

declare const AlertDialogLabel: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
>;

declare const AlertDialogDescription: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
>;
declare const AlertDialogOverlay: React.FunctionComponent<AlertDialogProps>;

declare const AlertDialogContent: React.FunctionComponent<
  AlertDialogContentProps
>;
