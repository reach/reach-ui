/**
 * Welcome to @reach/rect!
 *
 * Measures DOM elements (aka. bounding client rect).
 *
 * @see getBoundingClientRect https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
 * @see Docs                  https://reach.tech/rect
 * @see Source                https://github.com/reach/reach-ui/tree/main/packages/rect
 */

import * as React from "react";
import PropTypes from "prop-types";
import observeRect from "@reach/observe-rect";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "@reach/utils/use-isomorphic-layout-effect";
import { isBoolean, isFunction } from "@reach/utils/type-check";
import warning from "tiny-warning";

////////////////////////////////////////////////////////////////////////////////

/**
 * Rect
 *
 * @param props
 */
const Rect: React.FC<RectProps> = ({ onChange, observe = true, children }) => {
  const ref = React.useRef<HTMLElement | null>(null);
  const rect = useRect(ref, { observe, onChange });
  return children({ ref, rect });
};

/**
 * @see Docs https://reach.tech/rect#rect-props
 */
type RectProps = UseRectOptions & {
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

function useRect<T extends Element = HTMLElement>(
  nodeRef: React.RefObject<T | undefined | null>,
  options?: UseRectOptions
): null | DOMRect;

function useRect<T extends Element = HTMLElement>(
  nodeRef: React.RefObject<T | undefined | null>,
  observe?: UseRectOptions["observe"],
  onChange?: UseRectOptions["onChange"]
): null | DOMRect;

/**
 * useRect
 *
 * @param nodeRef
 * @param observe
 * @param onChange
 */
function useRect<T extends Element = HTMLElement>(
  nodeRef: React.RefObject<T | undefined | null>,
  observeOrOptions?: boolean | UseRectOptions,
  deprecated_onChange?: UseRectOptions["onChange"]
): null | DOMRect {
  let observe: boolean;
  let onChange: UseRectOptions["onChange"];
  if (isBoolean(observeOrOptions)) {
    observe = observeOrOptions;
  } else {
    observe = observeOrOptions?.observe ?? true;
    onChange = observeOrOptions?.onChange;
  }
  if (isFunction(deprecated_onChange)) {
    onChange = deprecated_onChange;
  }

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      warning(
        !isBoolean(observeOrOptions),
        "Passing `observe` as the second argument to `useRect` is deprecated and will be removed in a future version of Reach UI. Instead, you can pass an object of options with an `observe` property as the second argument (`useRect(ref, { observe })`).\n" +
          "See https://reach.tech/rect#userect-observe"
      );
    }, [observeOrOptions]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      warning(
        !isFunction(deprecated_onChange),
        "Passing `onChange` as the third argument to `useRect` is deprecated and will be removed in a future version of Reach UI. Instead, you can pass an object of options with an `onChange` property as the second argument (`useRect(ref, { onChange })`).\n" +
          "See https://reach.tech/rect#userect-onchange"
      );
    }, [deprecated_onChange]);
  }

  let [element, setElement] = React.useState(nodeRef.current);
  let initialRectIsSet = React.useRef(false);
  let initialRefIsSet = React.useRef(false);
  let [rect, setRect] = React.useState<DOMRect | null>(null);
  let onChangeRef = React.useRef(onChange);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    if (nodeRef.current !== element) {
      setElement(nodeRef.current);
    }
  });

  useLayoutEffect(() => {
    if (element && !initialRectIsSet.current) {
      initialRectIsSet.current = true;
      setRect(element.getBoundingClientRect());
    }
  }, [element]);

  useLayoutEffect(() => {
    if (!observe) {
      return;
    }

    let elem = element;
    // State initializes before refs are placed, meaning the element state will
    // be undefined on the first render. We still want the rect on the first
    // render, so initially we'll use the nodeRef that was passed instead of
    // state for our measurements.
    if (!initialRefIsSet.current) {
      initialRefIsSet.current = true;
      elem = nodeRef.current;
    }

    if (!elem) {
      if (__DEV__) {
        console.warn("You need to place the ref");
      }
      return;
    }

    let observer = observeRect(elem, (rect) => {
      onChangeRef.current?.(rect);
      setRect(rect);
    });
    observer.observe();
    return () => {
      observer.unobserve();
    };
  }, [observe, element, nodeRef]);

  return rect;
}

/**
 * @see Docs https://reach.tech/rect#userect
 */
type UseRectOptions = {
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
   * @see Docs https://reach.tech/rect#userect-observe
   */
  observe?: boolean;
  /**
   * Calls back whenever the `rect` of the element changes.
   *
   * @see Docs https://reach.tech/rect#userect-onchange
   */
  onChange?: (rect: PRect) => void;
};

type PRect = Partial<DOMRect> & {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
};

////////////////////////////////////////////////////////////////////////////////
// Exports

export default Rect;
export type { PRect, UseRectOptions, RectProps };
export { Rect, useRect };
