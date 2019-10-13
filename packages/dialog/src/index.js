import React from "react";
import Portal from "@reach/portal";
import { checkStyles, wrapEvent, assignRef } from "@reach/utils";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import { func, bool } from "prop-types";

const noop = () => {};

export const DialogOverlay = React.forwardRef(function DialogOverlay(
  { isOpen = true, ...props },
  forwardedRef
) {
  const ownRef = React.useRef(null);
  const ref = forwardedRef || ownRef;
  React.useEffect(() => {
    checkStyles("dialog");
  }, []);

  return isOpen ? (
    <Portal data-reach-dialog-wrapper>
      <DialogInner ref={ref} {...props} />
    </Portal>
  ) : null;
});

DialogOverlay.propTypes = {
  initialFocusRef: () => {}
};

const DialogInner = React.forwardRef(function DialogPortal(
  {
    initialFocusRef,
    onClick,
    onDismiss = noop,
    onMouseDown,
    onKeyDown,
    ...props
  },
  forwardedRef
) {
  const mouseDownTarget = React.useRef(null);
  const overlayNode = React.useRef(null);
  const ref = useForkedRef(overlayNode, forwardedRef);

  React.useEffect(() => createAriaHider(forwardedRef.current), [forwardedRef]);

  return (
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
            if (mouseDownTarget.current === event.target) {
              event.stopPropagation();
              onDismiss(event);
            }
          })}
          onMouseDown={wrapEvent(onMouseDown, event => {
            mouseDownTarget.current = event.target;
          })}
          onKeyDown={wrapEvent(onKeyDown, event => {
            if (event.key === "Escape") {
              event.stopPropagation();
              onDismiss(event);
            }
          })}
          ref={ref}
          {...props}
        />
      </RemoveScroll>
    </FocusLock>
  );
});

export const DialogContent = React.forwardRef(function DialogContent(
  { onClick, onKeyDown, ...props },
  forwardedRef
) {
  return (
    <div
      aria-modal="true"
      data-reach-dialog-content
      tabIndex="-1"
      onClick={wrapEvent(onClick, event => {
        event.stopPropagation();
      })}
      ref={forwardedRef}
      {...props}
    />
  );
});

export const Dialog = ({
  isOpen,
  onDismiss = noop,
  initialFocusRef,
  ...props
}) => {
  return (
    <DialogOverlay
      isOpen={isOpen}
      onDismiss={onDismiss}
      initialFocusRef={initialFocusRef}
    >
      <DialogContent {...props} />
    </DialogOverlay>
  );
};

Dialog.propTypes = {
  isOpen: bool,
  onDismiss: func
};

function createAriaHider(dialogNode) {
  let originalValues = [];
  let rootNodes = [];

  if (!dialogNode) {
    if (__DEV__) {
      console.warn(
        "A ref has not yet been attached to a dialog node when attempting to call `createAriaHider`."
      );
    }
    return noop;
  }

  Array.prototype.forEach.call(document.querySelectorAll("body > *"), node => {
    const portalNode = dialogNode.parentNode.parentNode.parentNode;
    if (node === portalNode) {
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
}

// TODO: Remove and import from @reach/utils once it's been added to the package
function useForkedRef(...refs) {
  return React.useMemo(() => {
    if (refs.every(ref => ref == null)) {
      return null;
    }
    return node => {
      refs.forEach(ref => {
        assignRef(ref, node);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
