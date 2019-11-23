import React, { createContext } from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { useId } from "@reach/auto-id";
import { makeId } from "@reach/utils";
import invariant from "invariant";
import PropTypes from "prop-types";

let AlertDialogContext = createContext({});

////////////////////////////////////////////////////////////////////////////////
// AlertDialogOverlay

export const AlertDialogOverlay = React.forwardRef(function AlertDialogOverlay(
  { leastDestructiveRef, ...props },
  forwardRef
) {
  const id = useId(props.id);
  const labelId = makeId("alert-dialog", id);
  const descriptionId = makeId("alert-dialog-description", id);

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

AlertDialogOverlay.displayName = "AlertDialogOverlay";
if (__DEV__) {
  AlertDialogOverlay.propTypes = {
    isOpen: PropTypes.bool,
    onDismiss: PropTypes.func,
    leastDestructiveRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object
    ]),
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// AlertDialogContent

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

AlertDialogContent.displayName = "AlertDialogContent";
if (__DEV__) {
  AlertDialogContent.propTypes = {
    children: PropTypes.node
  };
}

////////////////////////////////////////////////////////////////////////////////
// AlertDialogLabel

export function AlertDialogLabel(props) {
  const { labelId } = React.useContext(AlertDialogContext);
  return <div id={labelId} data-reach-alert-dialog-label {...props} />;
}

AlertDialogLabel.displayName = "AlertDialogLabel";

////////////////////////////////////////////////////////////////////////////////
export function AlertDialogDescription(props) {
  const { descriptionId } = React.useContext(AlertDialogContext);
  return (
    <div id={descriptionId} data-reach-alert-dialog-description {...props} />
  );
}

AlertDialogDescription.displayName = "AlertDialogDescription";

////////////////////////////////////////////////////////////////////////////////
// AlertDialog

export function AlertDialog({
  id,
  isOpen,
  onDismiss,
  leastDestructiveRef,
  ...props
}) {
  return (
    <AlertDialogOverlay {...{ isOpen, onDismiss, leastDestructiveRef, id }}>
      <AlertDialogContent {...props} />
    </AlertDialogOverlay>
  );
}

AlertDialog.displayName = "AlertDialog";
if (__DEV__) {
  AlertDialog.propTypes = {
    isOpen: PropTypes.bool,
    onDismiss: PropTypes.func,
    leastDestructiveRef: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object
    ]),
    children: PropTypes.node
  };
}
