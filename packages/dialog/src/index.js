import React from "react";
import Component from "@reach/component-component";
import Portal from "@reach/portal";
import { checkStyles, wrapEvent } from "@reach/utils";
import createFocusTrap from "focus-trap";
import { func, bool } from "prop-types";

let createAriaHider = dialogNode => {
  let originalValues = [];
  let rootNodes = [];

  Array.prototype.forEach.call(document.querySelectorAll("body > *"), node => {
    if (node === dialogNode.parentNode) {
      return;
    }
    let attr = node.getAttribute("aria-hidden");
    let alreadyHidden = attr !== null && attr !== "false";
    if (alreadyHidden) {
      return;
    }
    originalValues.push(attr);
    rootNodes.push(node);
    node.setAttribute("aria-hidden", "true");
  });

  return () => {
    rootNodes.forEach((node, index) => {
      let originalValue = originalValues[index];
      if (originalValue === null) {
        node.removeAttribute("aria-hidden");
      } else {
        node.setAttribute("aria-hidden", originalValue);
      }
    });
  };
};

let k = () => {};

let checkDialogStyles = () => checkStyles("dialog");

let portalDidMount = (refs, initialFocusRef) => {
  refs.disposeAriaHider = createAriaHider(refs.overlayNode);
  refs.trap = createFocusTrap(refs.overlayNode, {
    initialFocus: initialFocusRef ? () => initialFocusRef.current : undefined,
    fallbackFocus: refs.contentNode,
    escapeDeactivates: false,
    clickOutsideDeactivates: false
  });
  refs.trap.activate();
};

let contentWillUnmount = ({ refs }) => {
  refs.trap.deactivate();
  refs.disposeAriaHider();
};

let FocusContext = React.createContext();

let DialogOverlay = React.forwardRef(
  (
    {
      isOpen = true,
      onDismiss = k,
      initialFocusRef,
      onClick,
      onKeyDown,
      ...props
    },
    forwardRef
  ) => (
    <Component didMount={checkDialogStyles}>
      {isOpen ? (
        <Portal data-reach-dialog-wrapper>
          <Component
            refs={{ overlayNode: null, contentNode: null }}
            didMount={({ refs }) => {
              portalDidMount(refs, initialFocusRef);
            }}
            willUnmount={contentWillUnmount}
          >
            {({ refs }) => (
              <FocusContext.Provider value={node => (refs.contentNode = node)}>
                <div
                  data-reach-dialog-overlay
                  onClick={wrapEvent(onClick, event => {
                    event.stopPropagation();
                    onDismiss();
                  })}
                  onKeyDown={wrapEvent(onKeyDown, event => {
                    if (event.key === "Escape") {
                      event.stopPropagation();
                      onDismiss();
                    }
                  })}
                  ref={node => {
                    refs.overlayNode = node;
                    forwardRef && forwardRef(node);
                  }}
                  {...props}
                />
              </FocusContext.Provider>
            )}
          </Component>
        </Portal>
      ) : null}
    </Component>
  )
);

DialogOverlay.propTypes = {
  initialFocusRef: () => {}
};

let stopPropagation = event => event.stopPropagation();

let DialogContent = React.forwardRef(
  ({ onClick, onKeyDown, ...props }, forwardRef) => (
    <FocusContext.Consumer>
      {contentRef => (
        <div
          aria-modal="true"
          data-reach-dialog-content
          tabIndex="-1"
          onClick={wrapEvent(onClick, stopPropagation)}
          ref={node => {
            contentRef(node);
            forwardRef && forwardRef(node);
          }}
          {...props}
        />
      )}
    </FocusContext.Consumer>
  )
);

let Dialog = ({ isOpen, onDismiss = k, ...props }) => (
  <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
    <DialogContent {...props} />
  </DialogOverlay>
);

Dialog.propTypes = {
  isOpen: bool,
  onDismiss: func
};

export { DialogOverlay, DialogContent, Dialog };
