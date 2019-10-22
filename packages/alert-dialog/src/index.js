import React, { createContext } from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { useId } from "@reach/auto-id";
import { makeId } from "@reach/utils";
import invariant from "invariant";
import { func, bool, node, object, oneOfType } from "prop-types";

let AlertDialogContext = createContext({});

export const AlertDialogOverlay = React.forwardRef(function AlertDialogOverlay(
  { leastDestructiveRef, ...props },
  forwardRef
) {
  const labelId = useId("alert-dialog");
  const descriptionId = useId("alert-dialog-description");

  return (
    <AlertDialogContext.Provider
      value={{
        labelId,
        descriptionId,
        leastDestructiveRef
      }}
    >
      <DialogOverlay
        ref={forwardRef}
        data-reach-alert-dialog-overlay
        initialFocusRef={leastDestructiveRef}
        {...props}
      />
    </AlertDialogContext.Provider>
  );
});

if (__DEV__) {
  AlertDialogOverlay.propTypes = {
    isOpen: bool,
    onDismiss: func,
    leastDestructiveRef: oneOfType([func, object]),
    children: node
  };
}

export const AlertDialogContent = React.forwardRef(function AlertDialogContent(
  { children, ...props },
  forwardRef
) {
  const { labelId, leastDestructiveRef } = React.useContext(AlertDialogContext);
  React.useEffect(() => {
    invariant(
      document.getElementById(labelId),
      `@reach/alert-dialog: You must render a \`<AlertDialogLabel>\`
        inside an \`<AlertDialog/>\`.`
    );
    invariant(
      leastDestructiveRef,
      `@reach/alert-dialog: You must provide a \`leastDestructiveRef\` to
        \`<AlertDialog>\` or \`<AlertDialogOverlay/>\`. Please see
        https://ui.reach.tech/alert-dialog/#alertdialogoverlay-leastdestructiveref`
    );
  }, [labelId, leastDestructiveRef]);
  return (
    <DialogContent
      ref={forwardRef}
      // lol: remove in 1.0
      data-reach-alert-dialong-content
      data-reach-alert-dialog-content
      role="alertdialog"
      aria-labelledby={labelId}
      {...props}
    >
      {children}
    </DialogContent>
  );
});

if (__DEV__) {
  AlertDialogContent.propTypes = {
    children: node
  };
}

export const AlertDialogLabel = props => {
  const { labelId } = React.useContext(AlertDialogContext);
  return <div id={labelId} data-reach-alert-dialog-label {...props} />;
};

export const AlertDialogDescription = props => {
  const { descriptionId } = React.useContext(AlertDialogContext);
  return (
    <div id={descriptionId} data-reach-alert-dialog-description {...props} />
  );
};

export const AlertDialog = ({
  isOpen,
  onDismiss,
  leastDestructiveRef,
  ...props
}) => (
  <AlertDialogOverlay {...{ isOpen, onDismiss, leastDestructiveRef }}>
    <AlertDialogContent {...props} />
  </AlertDialogOverlay>
);

if (__DEV__) {
  AlertDialog.propTypes = {
    isOpen: bool,
    onDismiss: func,
    leastDestructiveRef: oneOfType([func, object]),
    children: node
  };
}
