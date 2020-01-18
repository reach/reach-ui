/* eslint-disable jsx-a11y/no-static-element-interactions */

/**
 * Welcome to @reach/dialog!
 *
 * An accessible dialog or "modal" window.
 *
 * @see Docs     https://reacttraining.com/reach-ui/dialog
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/dialog
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal
 */

import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import Portal from "@reach/portal";
import { checkStyles, noop, useForkedRef, wrapEvent } from "@reach/utils";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import PropTypes from "prop-types";

const overlayPropTypes = {
  initialFocusRef: (() => {}) as any,
  allowPinchZoom: PropTypes.bool,
  onDismiss: PropTypes.func
};

////////////////////////////////////////////////////////////////////////////////

/**
 * DialogOverlay
 *
 * Low-level component if you need more control over the styles or rendering of
 * the dialog overlay.
 *
 * Note: You must render a `DialogContent` inside.
 *
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialogoverlay
 */
export const DialogOverlay = forwardRef<HTMLDivElement, DialogProps>(
  function DialogOverlay({ isOpen = true, ...props }, forwardedRef) {
    useEffect(() => checkStyles("dialog"), []);
    return isOpen ? (
      <Portal data-reach-dialog-wrapper="">
        <DialogInner ref={forwardedRef} {...props} />
      </Portal>
    ) : null;
  }
);

DialogOverlay.displayName = "DialogOverlay";
if (__DEV__) {
  DialogOverlay.propTypes = {
    ...overlayPropTypes,
    isOpen: PropTypes.bool
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DialogInner
 */
const DialogInner = forwardRef<HTMLDivElement, DialogProps>(
  function DialogInner(
    {
      allowPinchZoom,
      initialFocusRef,
      onClick,
      onDismiss = noop,
      onMouseDown,
      onKeyDown,
      ...props
    },
    forwardedRef
  ) {
    const mouseDownTarget = useRef<EventTarget | null>(null);
    const overlayNode = useRef<HTMLDivElement | null>(null);
    const ref = useForkedRef(overlayNode, forwardedRef);

    const activateFocusLock = useCallback(() => {
      if (initialFocusRef && initialFocusRef.current) {
        initialFocusRef.current.focus();
      }
    }, [initialFocusRef]);

    function handleClick(event: React.MouseEvent) {
      if (mouseDownTarget.current === event.target) {
        event.stopPropagation();
        onDismiss(event);
      }
    }

    function handleKeyDown(event: React.KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onDismiss(event);
      }
    }

    function handleMouseDown(event: React.MouseEvent) {
      mouseDownTarget.current = event.target;
    }

    useEffect(
      () =>
        overlayNode.current ? createAriaHider(overlayNode.current) : void null,
      []
    );

    return (
      <FocusLock autoFocus returnFocus onActivation={activateFocusLock}>
        <RemoveScroll allowPinchZoom={allowPinchZoom}>
          <div
            {...props}
            ref={ref}
            data-reach-dialog-overlay=""
            /*
             * We can ignore the `no-static-element-interactions` warning here
             * because our overlay is only designed to capture any outside
             * clicks, not to serve as a clickable element itself.
             */
            onClick={wrapEvent(onClick, handleClick)}
            onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
            onMouseDown={wrapEvent(onMouseDown, handleMouseDown)}
          />
        </RemoveScroll>
      </FocusLock>
    );
  }
);

DialogOverlay.displayName = "DialogOverlay";
if (__DEV__) {
  DialogOverlay.propTypes = {
    ...overlayPropTypes
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * DialogContent
 *
 * Low-level component if you need more control over the styles or rendering of
 * the dialog content.
 *
 * Note: Must be a child of `DialogOverlay`.
 *
 * Note: You only need to use this when you are also styling `DialogOverlay`,
 * otherwise you can use the high-level `Dialog` component and pass the props
 * to it. Any props passed to `Dialog` component (besides `isOpen` and
 * `onDismiss`) will be spread onto `DialogContent`.
 *
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialogcontent
 */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ onClick, onKeyDown, ...props }, forwardedRef) {
    return (
      <div
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        {...props}
        ref={forwardedRef}
        data-reach-dialog-content=""
        onClick={wrapEvent(onClick, event => {
          event.stopPropagation();
        })}
      />
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialogcontent-props
 */
export type DialogContentProps = {
  /**
   * Accepts any renderable content.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialogcontent-children
   */
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

DialogContent.displayName = "DialogContent";
if (__DEV__) {
  DialogContent.propTypes = {
    "aria-label": ariaLabelType,
    "aria-labelledby": ariaLabelType
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Dialog
 *
 * High-level component to render a modal dialog window over the top of the page
 * (or another dialog).
 *
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialog
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { isOpen, onDismiss = noop, initialFocusRef, ...props },
  forwardedRef
) {
  return (
    <DialogOverlay
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <DialogContent ref={forwardedRef} {...props} />
    </DialogOverlay>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialog-props
 */
export type DialogProps = {
  allowPinchZoom?: boolean;
  /**
   * Controls whether the dialog is open or not.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialog-isopen
   */
  isOpen?: boolean;
  /**
   * This function is called whenever the user hits "Escape" or clicks outside
   * the dialog. _It's important to close the dialog `onDismiss`_.
   *
   * The only time you shouldn't close the dialog on dismiss is when the dialog
   * requires a choice and none of them are "cancel". For example, perhaps two
   * records need to be merged and the user needs to pick the surviving record.
   * Neither choice is less destructive than the other, so in these cases you
   * may want to alert the user they need to a make a choice on dismiss instead
   * of closing the dialog.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialog-ondismiss
   */
  onDismiss?: (event?: React.SyntheticEvent) => void;
  /**
   * Accepts any renderable content.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialog-children
   */
  children?: React.ReactNode;
  /**
   * By default the first focusable element will receive focus when the dialog
   * opens but you can provide a ref to focus instead.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialogoverlay-initialfocusref
   */
  initialFocusRef?: React.RefObject<any>;
} & React.HTMLAttributes<HTMLDivElement>;

Dialog.displayName = "Dialog";
if (__DEV__) {
  Dialog.propTypes = {
    isOpen: PropTypes.bool,
    onDismiss: PropTypes.func,
    "aria-label": ariaLabelType,
    "aria-labelledby": ariaLabelType
  };
}

export default Dialog;

////////////////////////////////////////////////////////////////////////////////
function createAriaHider(dialogNode: HTMLElement) {
  let originalValues: any[] = [];
  let rootNodes: HTMLElement[] = [];

  if (!dialogNode) {
    if (__DEV__) {
      console.warn(
        "A ref has not yet been attached to a dialog node when attempting to call `createAriaHider`."
      );
    }
    return noop;
  }

  Array.prototype.forEach.call(document.querySelectorAll("body > *"), node => {
    const portalNode = dialogNode.parentNode?.parentNode?.parentNode;
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

function ariaLabelType(
  props: { [key: string]: any },
  propName: string,
  compName: string,
  location: string,
  propFullName: string
) {
  const details =
    "\nSee https://www.w3.org/TR/wai-aria/#aria-label for details.";
  if (!props["aria-label"] && !props["aria-labelledby"]) {
    return new Error(
      `A <${compName}> must have either an \`aria-label\` or \`aria-labelledby\` prop.
      ${details}`
    );
  }
  if (props["aria-label"] && props["aria-labelledby"]) {
    return new Error(
      "You provided both `aria-label` and `aria-labelledby` props to a <" +
        compName +
        ">. If the a label for this component is visible on the screen, that label's component should be given a unique ID prop, and that ID should be passed as the `aria-labelledby` prop into <" +
        compName +
        ">. If the label cannot be determined programmatically from the content of the element, an alternative label should be provided as the `aria-label` prop, which will be used as an `aria-label` on the HTML tag." +
        details
    );
  } else if (props[propName] != null && typeof props[propName] !== "string") {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${compName}\`. Expected \`string\`, received \`${
        Array.isArray(propFullName) ? "array" : typeof propFullName
      }\`.`
    );
  }
  return null;
}
