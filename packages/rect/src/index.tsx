/**
 * Welcome to @reach/rect!
 *
 * Measures DOM elements (aka. bounding client rect).
 *
 * @see getBoundingClientRect https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
 * @see Docs                  https://reacttraining.com/reach-ui/rect
 * @see Source                https://github.com/reach/reach-ui/tree/master/packages/rect
 */

import React, { useRef, useState, useLayoutEffect } from "react";
import PropTypes from "prop-types";
import observeRect from "@reach/observe-rect";

////////////////////////////////////////////////////////////////////////////////

/**
 * Rect
 *
 * @param props
 */
export const Rect: React.FC<RectProps> = ({
  onChange,
  observe = true,
  children
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const rect = useRect(ref, observe, onChange);
  return children({ ref, rect });
};

/**
 * @see Docs https://reacttraining.com/reach-ui/rect#rect-props
 */
export type RectProps = {
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
  onChange?: (rect: PRect) => void;
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
  children(args: { rect: PRect | null; ref: React.Ref<any> }): JSX.Element;
};

Rect.displayName = "Rect";

if (__DEV__) {
  Rect.propTypes = {
    children: PropTypes.func.isRequired,
    observe: PropTypes.bool,
    onChange: PropTypes.func
  };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * useRect
 *
 * @param nodeRef
 * @param observe
 * @param onChange
 */
export function useRect<T extends HTMLElement = HTMLElement>(
  nodeRef: React.RefObject<T>,
  observe: boolean = true,
  onChange?: (rect: DOMRect) => void
): null | DOMRect {
  let initialRectSet = useRef(false);
  let [rect, setRect] = useState<DOMRect | null>(null);
  let observerRef = useRef<any>(null);
  useLayoutEffect(() => {
    const cleanup = () => {
      observerRef.current && observerRef.current.unobserve();
    };

    if (!nodeRef.current) {
      console.warn("You need to place the ref");
      return cleanup;
    }

    if (!observerRef.current) {
      observerRef.current = observeRect(nodeRef.current, (rect: DOMRect) => {
        onChange && onChange(rect);
        setRect(rect);
      });
    }

    if (!initialRectSet.current) {
      initialRectSet.current = true;
      setRect(nodeRef.current.getBoundingClientRect());
    }

    observe && observerRef.current.observe();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observe, onChange]);

  return rect;
}

export default Rect;

export type PartialRect = Partial<PRect>;

export type PRect = Partial<DOMRect> & {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
};
