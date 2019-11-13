import React, { createContext, useState, useEffect, useRef } from "react";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { useId } from "@reach/auto-id";
import invariant from "invariant";
import { func, bool, node, object, oneOfType } from "prop-types";

let AlertDialogContext = createContext({});

export const AlertDialogOverlay = React.forwardRef(function AlertDialogOverlay(
  { leastDestructiveRef, ...props },
  forwardRef
) {
  // generate a label ID, but allow it to be overwritten by setting an ID on <AlertDialogLabel>
  const [labelId, setLabelId] = useState(useId("alert-dialog-label"));
  // don't set immediately, since <AlertDialogDescription> is not required
  const [descriptionId, setDescriptionId] = useState();

  return (
    <AlertDialogContext.Provider
      value={{
        labelId,
        setLabelId,
        descriptionId,
        setDescriptionId,
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
  const { labelId, leastDestructiveRef, descriptionId } = React.useContext(
    AlertDialogContext
  );

  const timer = useRef();
  React.useEffect(() => {
    // defer these checks for 1 tick to allow <AlertDialogLabel> and
    // <AlertDialogDescription> to update their labels via context
    timer.current = setTimeout(() => {
      invariant(
        document.getElementById(labelId),
        `@reach/alert-dialog: You must render a \`<AlertDialogLabel>\`
        inside an \`<AlertDialog/>\`.`
      );
    }, 1);
    invariant(
      leastDestructiveRef,
      `@reach/alert-dialog: You must provide a \`leastDestructiveRef\` to
        \`<AlertDialog>\` or \`<AlertDialogOverlay/>\`. Please see
        https://ui.reach.tech/alert-dialog/#alertdialogoverlay-leastdestructiveref`
    );

    return () => {
      clearTimeout(timer.current);
    };
  }, [labelId, leastDestructiveRef, descriptionId]);
  return (
    <DialogContent
      ref={forwardRef}
      // lol: remove in 1.0
      data-reach-alert-dialong-content
      data-reach-alert-dialog-content
      role="alertdialog"
      {...props}
      aria-labelledby={labelId}
      {...(descriptionId ? { "aria-describedby": descriptionId } : {})}
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

export const AlertDialogLabel = ({ id, ...props }) => {
  const { labelId, setLabelId } = React.useContext(AlertDialogContext);
  useEffect(() => {
    // if we've set id on label, notify AlertDialogContent
    if (id) {
      setLabelId(id);
    }
  }, [id, setLabelId]);
  return <div id={labelId} data-reach-alert-dialog-label {...props} />;
};

export const AlertDialogDescription = ({ id, ...props }) => {
  const { setDescriptionId } = React.useContext(AlertDialogContext);
  const generatedId = useId("alert-dialog-desc");
  const descriptionId = id || generatedId;
  useEffect(() => {
    setDescriptionId(descriptionId);
  }, [descriptionId, setDescriptionId]);
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
