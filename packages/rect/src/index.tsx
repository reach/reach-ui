/**
 * Welcome to @reach/rect!
 *
 * Measures DOM elements (aka. bounding client rect).
 *
 * @see getBoundingClientRect https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
 * @see Docs                  https://reach.tech/rect
 * @see Source                https://github.com/reach/reach-ui/tree/main/packages/rect
 */

import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import observeRect from "@reach/observe-rect";
import { useIsomorphicLayoutEffect } from "@reach/utils";

////////////////////////////////////////////////////////////////////////////////

/**
 * Rect
 *
 * @param props
 */
export const Rect: React.FC<RectProps> = ({
  onChange,
  observe = true,
  children,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const rect = useRect(ref, observe, onChange);
  return children({ ref, rect });
};

/**
 * @see Docs https://reach.tech/rect#rect-props
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
   * @see Docs https://reach.tech/rect#rect-observe
   */
  observe?: boolean;
  /**
   * Calls back whenever the `rect` of the element changes.
   *
   * @see Docs https://reach.tech/rect#rect-onchange
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
   * @see Docs https://reach.tech/rect#rect-onchange
   */
  children(args: {
    rect: PRect | null;
    ref: React.RefObject<any>;
  }): JSX.Element;
};

if (__DEV__) {
  Rect.displayName = "Rect";
  Rect.propTypes = {
    children: PropTypes.func.isRequired,
    observe: PropTypes.bool,
    onChange: PropTypes.func,
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
export function useRect<T extends Element = HTMLElement>(
  nodeRef: React.RefObject<T | undefined | null>,
  observe: boolean = true,
  onChange?: (rect: DOMRect) => void
): null | DOMRect {
  let [element, setElement] = useState(nodeRef.current);
  let initialRectIsSet = useRef(false);
  let initialRefIsSet = useRef(false);
  let [rect, setRect] = useState<DOMRect | null>(null);
  let onChangeRef = useRef<typeof onChange>();

  useIsomorphicLayoutEffect(() => {
    onChangeRef.current = onChange;
    if (nodeRef.current !== element) {
      setElement(nodeRef.current);
    }
  });

  useIsomorphicLayoutEffect(() => {
    if (element && !initialRectIsSet.current) {
      initialRectIsSet.current = true;
      setRect(element.getBoundingClientRect());
    }
  }, [element]);

  useIsomorphicLayoutEffect(() => {
    let observer: ReturnType<typeof observeRect>;
    let elem = element;

    // State initializes before refs are placed, meaning the element state will
    // be undefined on the first render. We still want the rect on the first
    // render, so initially we'll use the nodeRef that was passed instead of
    // state for our measurements.
    if (!initialRefIsSet.current) {
      initialRefIsSet.current = true;
      elem = nodeRef.current;
    }

    if (!observe) {
      return cleanup;
    }

    if (!elem) {
      if (__DEV__) {
        console.warn("You need to place the ref");
      }
      return cleanup;
    }

    observer = observeRect(elem, (rect) => {
      onChangeRef.current && onChangeRef.current(rect);
      setRect(rect);
    });

    observer.observe();
    return cleanup;

    function cleanup() {
      observer && observer.unobserve();
    }
  }, [observe, element]);

  return rect;
}

export default Rect;

export type PRect = Partial<DOMRect> & {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
};
