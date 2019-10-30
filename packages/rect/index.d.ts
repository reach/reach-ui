/**
 * Measures DOM elements (aka. bounding client rect).
 *
 * @see getBoundingClientRect https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
 * @see Docs                  https://reacttraining.com/reach-ui/rect
 * @see Source                https://github.com/reach/reach-ui/tree/master/packages/rect
 */

import * as React from "react";

/**
 * @see Docs https://reacttraining.com/reach-ui/rect#rect-props
 */
export type RectProps<T = any> = {
  /**
   * Tells `Rect` to observe the position of the node or not. While observing,
   * the `children` render prop may call back very quickly (especially while
   * scrolling) so it can be important for performance to avoid observing when
   * you don't need to.
   *
   * This is typically used for elements that pop over other elements (like a
   * dropdown menu), so you don't need to observe all the time, only when the
   * popup is active.
   *
   * Pass `true` to observe, `false` to ignore.
   *
   * @see Docs https://reacttraining.com/reach-ui/rect#rect-observe
   */
  observe?: boolean;
  /**
   * Calls back whenever the `rect` of the element changes.
   *
   * @see Docs https://reacttraining.com/reach-ui/rect#rect-onchange
   */
  onChange?: (rect: DOMRect) => void;
  /**
   * A function that calls back to you with a `ref` to place on an element and
   * the `rect` measurements of the dom node.
   *
   * **Note**: On the first render `rect` will be `undefined` because we can't
   * measure a node that has not yet been rendered. Make sure your code accounts
   * for this.
   *
   * @see Docs https://reacttraining.com/reach-ui/rect#rect-onchange
   */
  children?(args: { rect: DOMRect; ref: React.Ref<T> }): React.ReactNode;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/rect#rect
 */
declare const Rect: React.FunctionComponent<RectProps>;

/**
 *
 * @template T The type for React.Ref to expect (default: `any`)
 * @param {React.Ref<T>} ref The ref that will be passed to the DOM node for measuring
 * @param {boolean} [observe] The condition for observing the node.
 * @param {(rect: DOMRect) => void} [onChange] Callback to fire when `rect` changes
 *
 * @see Docs https://reacttraining.com/reach-ui/rect#use-rect
 */
export function useRect<T = any>(
  ref: React.Ref<T>,
  observe?: boolean,
  onChange?: (rect: DOMRect) => void
): DOMRect;

export default Rect;
