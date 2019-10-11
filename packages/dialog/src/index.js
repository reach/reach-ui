import React from "react";
import Component from "@reach/component-component";
import Portal from "@reach/portal";
import { checkStyles, wrapEvent, assignRef } from "@reach/utils";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import { func, bool } from "prop-types";

const createAriaHider = dialogNode => {
  const originalValues = [];
  const rootNodes = [];

  Array.prototype.forEach.call(document.querySelectorAll("body > *"), node => {
    const portalNode = dialogNode.parentNode.parentNode.parentNode;
    if (node === portalNode) {
      return;
    }
    const attr = node.getAttribute("aria-hidden");
    const alreadyHidden = attr !== null && attr !== "false";
    if (alreadyHidden) {
      return;
    }
    originalValues.push(attr);
    rootNodes.push(node);
    node.setAttribute("aria-hidden", "true");
  });

  return () => {
    rootNodes.forEach((node, index) => {
      const originalValue = originalValues[index];
      if (originalValue === null) {
        node.removeAttribute("aria-hidden");
      } else {
        node.setAttribute("aria-hidden", originalValue);
      }
    });
  };
};

const k = () => {};

const checkDialogStyles = () => checkStyles("dialog");

const portalDidMount = refs => {
  refs.disposeAriaHider = createAriaHider(refs.overlayNode);
};

const contentWillUnmount = ({ refs }) => {
  refs.disposeAriaHider();
};

// eslint-disable-next-line no-unused-vars
const FocusContext = React.createContext();

const DialogOverlay = React.forwardRef(
  (
    {
      isOpen = true,
      onDismiss = k,
      onMouseDown,
      initialFocusRef,
      onClick,
      onKeyDown,
      ...props
    },
    forwardedRef
  ) => {
    return (
      <Component didMount={checkDialogStyles}>
        {isOpen ? (
          <Portal data-reach-dialog-wrapper>
            <Component
              refs={{ overlayNode: null, mouseDownTarget: null }}
              didMount={({ refs }) => {
                portalDidMount(refs);
              }}
              willUnmount={contentWillUnmount}
            >
              {({ refs }) => (
                <FocusLock
                  returnFocus
                  onActivation={() => {
                    if (initialFocusRef) {
                      initialFocusRef.current.focus();
                    }
                  }}
                >
                  <RemoveScroll>
                    <div
                      data-reach-dialog-overlay
                      onClick={wrapEvent(onClick, event => {
                        if (refs.mouseDownTarget === event.target) {
                          event.stopPropagation();
                          onDismiss(event);
                        }
                      })}
                      onMouseDown={wrapEvent(onMouseDown, event => {
                        refs.mouseDownTarget = event.target;
                      })}
                      onKeyDown={wrapEvent(onKeyDown, event => {
                        if (event.key === "Escape") {
                          event.stopPropagation();
                          onDismiss(event);
                        }
                      })}
                      ref={node => {
                        refs.overlayNode = node;
                        assignRef(forwardedRef, node);
                      }}
                      {...props}
                    />
                  </RemoveScroll>
                </FocusLock>
              )}
            </Component>
          </Portal>
        ) : null}
      </Component>
    );
  }
);

DialogOverlay.propTypes = {
  initialFocusRef: () => {}
};

const stopPropagation = event => event.stopPropagation();

const DialogContent = React.forwardRef(
  ({ onClick, onKeyDown, ...props }, forwardedRef) => (
    <div
      aria-modal="true"
      data-reach-dialog-content
      tabIndex="-1"
      onClick={wrapEvent(onClick, stopPropagation)}
      ref={node => {
        assignRef(forwardedRef, node);
      }}
      {...props}
    />
  )
);

const Dialog = ({ isOpen, onDismiss = k, initialFocusRef, ...props }) => (
  <DialogOverlay
    isOpen={isOpen}
    onDismiss={onDismiss}
    initialFocusRef={initialFocusRef}
  >
    <DialogContent {...props} />
  </DialogOverlay>
);

Dialog.propTypes = {
  isOpen: bool,
  onDismiss: func
};

export { DialogOverlay, DialogContent, Dialog };
