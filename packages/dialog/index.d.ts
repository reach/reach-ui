/**
 * An accessible dialog or "modal" window.
 *
 * @see Docs     https://reacttraining.com/reach-ui/dialog
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/dialog
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal
 */

import * as React from "react";

/**
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialog-props
 */
export type DialogProps = {
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
  onDismiss?: () => void;
  /**
   * Accepts any renderable content.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialog-children
   */
  children?: React.ReactNode;
} & React.HTMLProps<HTMLDivElement>;

/**
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialogoverlay-props
 */
export type DialogOverlayProps = {
  /**
   * Allow two-finger zoom gestures on iOS devices
   *
   * @see Docs https://github.com/reach/reach-ui/issues/325
   */
  allowPinchZoom?: boolean;
  /**
   * By default the first focusable element will receive focus when the dialog
   * opens but you can provide a ref to focus instead.
   *
   * @see Docs https://reacttraining.com/reach-ui/dialog#dialogoverlay-initialfocusref
   */
  initialFocusRef?: React.Ref<any>;
} & DialogProps;

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
} & React.HTMLProps<HTMLDivElement>;

/**
 * High-level component to render a modal dialog window over the top of the page
 * (or another dialog).
 *
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialog
 */
export const Dialog: React.FunctionComponent<DialogProps>;

/**
 * Low-level component if you need more control over the styles or rendering of
 * the dialog overlay.
 *
 * Note: You must render a `DialogContent` inside.
 *
 * @see Docs https://reacttraining.com/reach-ui/dialog#dialogoverlay
 */
export const DialogOverlay: React.FunctionComponent<DialogOverlayProps>;

/**
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
export const DialogContent: React.FunctionComponent<DialogContentProps>;

export default Dialog;
