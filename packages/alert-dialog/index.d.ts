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
  export const AlertDialogLabel: React.FC<HTMLDivElement>;
  export const AlertDialogDescription: React.FC<HTMLDivElement>;
  export const AlertDialogOverlay: React.FC<AlertDialogProps>;
  export const AlertDialogContent: React.FC<AlertDialogContentProps>;
}
