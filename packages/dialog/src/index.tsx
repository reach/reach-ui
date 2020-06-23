/* eslint-disable jsx-a11y/no-static-element-interactions */

/**
 * Welcome to @reach/dialog!
 *
 * An accessible dialog or "modal" window.
 *
 * @see Docs     https://reacttraining.com/reach-ui/dialog
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/dialog
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.2/#dialog_modal
 */

import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import Portal from "@reach/portal";
import {
  checkStyles,
  getOwnerDocument,
  isString,
  noop,
  useForkedRef,
  wrapEvent,
} from "@reach/utils";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import PropTypes from "prop-types";

const overlayPropTypes = {
  allowPinchZoom: PropTypes.bool,
  dangerouslyBypassFocusLock: PropTypes.bool,
  dangerouslyBypassScrollLock: PropTypes.bool,
  // TODO:
  initialFocusRef: () => null,
  onDismiss: PropTypes.func,
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
export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ isOpen = true, ...props }, forwardedRef) {
    useEffect(() => checkStyles("dialog"), []);

    // We want to ignore the immediate focus of a tooltip so it doesn't pop
    // up again when the menu closes, only pops up when focus returns again
    // to the tooltip (like native OS tooltips).
    useEffect(() => {
      if (isOpen) {
        // @ts-ignore
        window.__REACH_DISABLE_TOOLTIPS = true;
      } else {
        window.requestAnimationFrame(() => {
          // Wait a frame so that this doesn't fire before tooltip does
          // @ts-ignore
          window.__REACH_DISABLE_TOOLTIPS = false;
        });
      }
    }, [isOpen]);

    return isOpen ? (
      <Portal data-reach-dialog-wrapper="">
        <DialogInner ref={forwardedRef} {...props} />
      </Portal>
    ) : null;
  }
);

if (__DEV__) {
  DialogOverlay.displayName = "DialogOverlay";
  DialogOverlay.propTypes = {
    ...overlayPropTypes,
    isOpen: PropTypes.bool,
  };
}

export type DialogOverlayProps = DialogProps & {
  /**
   * By default the dialog locks the focus inside it. Normally this is what you
   * want. This prop is provided so that this feature can be disabled. This,
   * however, is strongly discouraged.
   *
   * The reason it is provided is not to disable the focus lock entirely.
   * Rather, there are certain situations where you may need more control on how
   * the focus lock works. This should be complemented by setting up a focus
   * lock yourself that would allow more flexibility for your specific use case.
   *
   * If you do set this prop to `true`, make sure you set up your own
   * `FocusLock` component. You can likely use
   * `react-focus-lock`, which is what Reach uses internally by default. It has
   * various settings to allow more customization, but it takes care of a lot of
   * hard work that you probably don't want or need to do.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialogoverlay-dangerouslybypassfocuslock
   * @see https://github.com/theKashey/react-focus-lock
   * @see https://github.com/reach/reach-ui/issues/615
   */
  dangerouslyBypassFocusLock?: boolean;
  /**
   * By default the dialog locks scrolling with `react-remove-scroll`, which
   * also injecs some styles on the body element to remove the scrollbar while
   * maintaining its gap to prevent jank when the dialog's open state is
   * toggled. This is almost always what you want in a dialog, but in some cases
   * you may have the need to customize this behavior further.
   *
   * This prop will disable `react-remove-scroll` and allow you to compose your
   * own scroll lock component to meet your needs. Like the
   * `dangerouslyBypassFocusLock` prop, this is generally discouraged and should
   * only be used if a proper fallback for managing scroll behavior is provided.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialogoverlay-dangerouslybypassscrolllock
   * @see https://github.com/theKashey/react-remove-scroll
   */
  dangerouslyBypassScrollLock?: boolean;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * DialogInner
 */
const DialogInner = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogInner(
    {
      allowPinchZoom,
      dangerouslyBypassFocusLock = false,
      dangerouslyBypassScrollLock = false,
      initialFocusRef,
      onClick,
      onDismiss = noop,
      onKeyDown,
      onMouseDown,
      unstable_lockFocusAcrossFrames = true,
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
      <FocusLock
        autoFocus
        returnFocus
        onActivation={activateFocusLock}
        disabled={dangerouslyBypassFocusLock}
        crossFrame={unstable_lockFocusAcrossFrames}
      >
        <RemoveScroll
          allowPinchZoom={allowPinchZoom}
          enabled={!dangerouslyBypassScrollLock}
        >
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

if (__DEV__) {
  DialogOverlay.displayName = "DialogOverlay";
  DialogOverlay.propTypes = {
    ...overlayPropTypes,
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
        onClick={wrapEvent(onClick, (event) => {
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

if (__DEV__) {
  DialogContent.displayName = "DialogContent";
  DialogContent.propTypes = {
    "aria-label": ariaLabelType,
    "aria-labelledby": ariaLabelType,
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
  {
    allowPinchZoom = false,
    initialFocusRef,
    isOpen,
    onDismiss = noop,
    ...props
  },
  forwardedRef
) {
  return (
    <DialogOverlay
      allowPinchZoom={allowPinchZoom}
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
  /**
   * Handle zoom/pinch gestures on iOS devices when scroll locking is enabled.
   * Defaults to `false`.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialog-allowpinchzoom
   */
  allowPinchZoom?: boolean;
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
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialog-initialfocusref
   */
  initialFocusRef?: React.RefObject<any>;
  /**
   * Controls whether or not the dialog is open.
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
   * By default, React Focus Lock prevents focus from being moved outside of the
   * locked element even if the thing trying to take focus is in another frame.
   * Normally this is what you want, as an iframe is typically going to be a
   * part of your page content. But in some situations, like when using Code
   * Sandbox, you can't use any of the controls or the editor in the sandbox
   * while dialog is open because of the focus lock.
   *
   * This prop may have some negative side effects and unintended consequences,
   * and it opens questions about how we might distinguish frames that *should*
   * steal focus from those that shouldn't. Perhaps it's best for app devs to
   * decide, and if they use this prop we should advise them to imperatively
   * assign a -1 tabIndex to other iframes that are a part of the page content
   * when the dialog is open.
   *
   * https://github.com/reach/reach-ui/issues/536
   */
  unstable_lockFocusAcrossFrames?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

if (__DEV__) {
  Dialog.displayName = "Dialog";
  Dialog.propTypes = {
    isOpen: PropTypes.bool,
    onDismiss: PropTypes.func,
    "aria-label": ariaLabelType,
    "aria-labelledby": ariaLabelType,
  };
}

export default Dialog;

////////////////////////////////////////////////////////////////////////////////
function createAriaHider(dialogNode: HTMLElement) {
  let originalValues: any[] = [];
  let rootNodes: HTMLElement[] = [];
  let ownerDocument = getOwnerDocument(dialogNode) || document;

  if (!dialogNode) {
    if (__DEV__) {
      console.warn(
        "A ref has not yet been attached to a dialog node when attempting to call `createAriaHider`."
      );
    }
    return noop;
  }

  Array.prototype.forEach.call(
    ownerDocument.querySelectorAll("body > *"),
    (node) => {
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
    }
  );

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
  } else if (props[propName] != null && !isString(props[propName])) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${compName}\`. Expected \`string\`, received \`${
        Array.isArray(propFullName) ? "array" : typeof propFullName
      }\`.`
    );
  }
  return null;
}
