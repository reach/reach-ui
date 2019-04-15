declare module "@reach/alert-dialog" {
  import { DialogProps, DialogContentProps } from "@reach/dialog";

  type AlertDialogProps = {
    isOpen?: boolean;
    onDismiss?: () => void;
    leastDestructiveRef?: React.RefObject<HTMLElement>;
    children: React.ReactNode;
  } & DialogProps;

  type AlertDialogContentProps = {
    children: React.ReactNode;
  } & DialogContentProps;

  export const AlertDialog: React.FC<AlertDialogProps>;
  export const AlertDialogLabel: React.SFC<HTMLDivElement>;
  export const AlertDialogDescription: React.SFC<HTMLDivElement>;
  export const AlertDialogOverlay: React.SFC<AlertDialogProps>;
  export const AlertDialogContent: React.SFC<AlertDialogContentProps>;
}
