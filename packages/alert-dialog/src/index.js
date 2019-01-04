import React, { createContext, forwardRef } from "react";
import Component from "@reach/component-component";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { Consumer as IdConsumer } from "@reach/utils/lib/IdContext";
import invariant from "invariant";

let AlertDialogContext = createContext();

let AlertDialogOverlay = ({ leastDestructiveRef, ...props }) => (
  <IdConsumer>
    {genId => (
      <Component
        getRefs={() => ({
          labelId: `alert-dialog-${genId()}`,
          descriptionId: `alert-dialog-${genId()}`,
          leastDestructiveRef
        })}
      >
        {({ refs }) => (
          <AlertDialogContext.Provider value={refs}>
            <DialogOverlay
              data-reach-alert-dialog-overlay
              initialFocusRef={leastDestructiveRef}
              {...props}
            />
          </AlertDialogContext.Provider>
        )}
      </Component>
    )}
  </IdConsumer>
);

let AlertDialogContent = ({ children, ...props }) => (
  <AlertDialogContext.Consumer>
    {refs => (
      <DialogContent
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
);

let AlertDialogLabel = props => (
  <AlertDialogContext.Consumer>
    {({ labelId }) => (
      <div id={labelId} data-reach-alert-dialog-label {...props} />
    )}
  </AlertDialogContext.Consumer>
);

let AlertDialogDescription = props => (
  <AlertDialogContext.Consumer>
    {({ descriptionId }) => (
      <div id={descriptionId} data-reach-alert-dialog-description {...props} />
    )}
  </AlertDialogContext.Consumer>
);

let AlertDialog = ({ isOpen, onDismiss, leastDestructiveRef, ...props }) => (
  <AlertDialogOverlay {...{ isOpen, onDismiss, leastDestructiveRef }}>
    <AlertDialogContent {...props} />
  </AlertDialogOverlay>
);

export {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogContent
};
