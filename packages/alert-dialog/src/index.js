import React, { createContext } from "react";
import Component from "@reach/component-component";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { useId } from "@reach/auto-id";
import invariant from "invariant";
import { func, bool, node, object, oneOfType } from "prop-types";

const AlertDialogContext = createContext();

const AlertDialogOverlay = React.forwardRef(
  ({ leastDestructiveRef, ...props }, forwardRef) => {
    const labelId = useId();
    const descriptionId = useId();
    return (
      <Component
        getRefs={() => ({
          labelId: `alert-dialog-${labelId}`,
          descriptionId: `alert-dialog-${descriptionId}`,
          leastDestructiveRef
        })}
      >
        {({ refs }) => (
          <AlertDialogContext.Provider value={refs}>
            <DialogOverlay
              ref={forwardRef}
              data-reach-alert-dialog-overlay
              initialFocusRef={leastDestructiveRef}
              {...props}
            />
          </AlertDialogContext.Provider>
        )}
      </Component>
    );
  }
);

if (__DEV__) {
  AlertDialogOverlay.propTypes = {
    isOpen: bool,
    onDismiss: func,
    leastDestructiveRef: oneOfType([func, object]),
    children: node
  };
}

const AlertDialogContent = React.forwardRef(
  ({ children, ...props }, forwardRef) => (
    <AlertDialogContext.Consumer>
      {refs => (
        <DialogContent
          ref={forwardRef}
          data-reach-alert-dialong-content
          role="alertdialog"
          aria-labelledby={refs.labelId}
          {...props}
        >
          <Component
            didMount={() => {
              invariant(
                document.getElementById(refs.labelId),
                `@reach/alert-dialog: You must render a \`<AlertDialogLabel>\`
              inside an \`<AlertDialog/>\`.`
              );
              invariant(
                refs.leastDestructiveRef,
                `@reach/alert-dialog: You must provide a \`leastDestructiveRef\` to
              \`<AlertDialog>\` or \`<AlertDialogOverlay/>\`. Please see
              https://ui.reach.tech/alert-dialog/#alertdialogoverlay-leastdestructiveref`
              );
            }}
            children={children}
          />
        </DialogContent>
      )}
    </AlertDialogContext.Consumer>
  )
);

if (__DEV__) {
  AlertDialogContent.propTypes = {
    children: node
  };
}

const AlertDialogLabel = props => (
  <AlertDialogContext.Consumer>
    {({ labelId }) => (
      <div id={labelId} data-reach-alert-dialog-label {...props} />
    )}
  </AlertDialogContext.Consumer>
);

const AlertDialogDescription = props => (
  <AlertDialogContext.Consumer>
    {({ descriptionId }) => (
      <div id={descriptionId} data-reach-alert-dialog-description {...props} />
    )}
  </AlertDialogContext.Consumer>
);

const AlertDialog = ({ isOpen, onDismiss, leastDestructiveRef, ...props }) => (
  <AlertDialogOverlay {...{ isOpen, onDismiss, leastDestructiveRef }}>
    <AlertDialogContent {...props} />
  </AlertDialogOverlay>
);

if (__DEV__) {
  AlertDialog.propTypes = {
    isOpen: bool,
    onDismiss: func,
    leastDestructiveRef: func,
    children: node
  };
}

export {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogContent
};
