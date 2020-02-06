/* eslint-disable no-restricted-globals, eqeqeq,  */

import React, {
  cloneElement,
  createContext,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  As,
  AssignableRef,
  ComponentWithAs,
  ComponentWithForwardedRef,
  DistributiveOmit,
  PropsFromAs,
  PropsWithAs,
  SingleOrArray,
} from "./types";

/**
 * React currently throws a warning when using useLayoutEffect on the server.
 * To get around it, we can conditionally useEffect on the server (no-op) and
 * useLayoutEffect in the browser. We occasionally need useLayoutEffect to
 * ensure we don't get a render flash for certain operations, but we may also
 * need affected components to render on the server. One example is when setting
 * a component's descendants to retrieve their index values.
 *
 * Important to note that using this hook as an escape hatch will break the
 * eslint dependency warnings unless you rename the import to `useLayoutEffect`.
 * Use sparingly only when the effect won't effect the rendered HTML to avoid
 * any server/client mismatch.
 *
 * If a useLayoutEffect is needed and the result would create a mismatch, it's
 * likely that the component in question shouldn't be rendered on the server at
 * all, so a better approach would be to lazily render those in a parent
 * component after client-side hydration.
 *
 * TODO: We are calling useLayoutEffect in a couple of places that will likely
 * cause some issues for SSR users, whether the warning shows or not. Audit and
 * fix these.
 *
 * https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
 * https://github.com/reduxjs/react-redux/blob/master/src/utils/useIsomorphicLayoutEffect.js
 *
 * @param effect
 * @param deps
 */
export const useIsomorphicLayoutEffect = canUseDOM()
  ? React.useLayoutEffect
  : React.useEffect;

const useLayoutEffect = useIsomorphicLayoutEffect;

let checkedPkgs: { [key: string]: boolean } = {};

/**
 * When in dev mode, checks that styles for a given @reach package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example checkStyles("dialog") will check for styles for @reach/dialog
 */
// @ts-ignore
let checkStyles = (packageName: string): void => void packageName;

if (__DEV__) {
  checkStyles = (packageName: string) => {
    // only check once per package
    if (checkedPkgs[packageName]) return;
    checkedPkgs[packageName] = true;

    if (
      process.env.NODE_ENV !== "test" &&
      parseInt(
        window
          .getComputedStyle(document.body)
          .getPropertyValue(`--reach-${packageName}`),
        10
      ) !== 1
    ) {
      console.warn(
        `@reach/${packageName} styles not found. If you are using a bundler like webpack or parcel include this in the entry file of your app before any of your own styles:

    import "@reach/${packageName}/styles.css";

  Otherwise you'll need to include them some other way:

    <link rel="stylesheet" type="text/css" href="node_modules/@reach/${packageName}/styles.css" />

  For more information visit https://ui.reach.tech/styling.
  `
      );
    }
  };
}

export { checkStyles };

/**
 * Passes or assigns an arbitrary value to a ref function or object.
 *
 * @param ref
 * @param value
 */
export function assignRef<RefValueType = any>(
  ref: AssignableRef<RefValueType> | null | undefined,
  value: any
) {
  if (ref == null) return;
  if (isFunction(ref)) {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
}

export function boolOrBoolString(value: any): value is "true" | true {
  return value === "true" ? true : isBoolean(value) ? value : false;
}

export function canUseDOM() {
  return (
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  );
}

export function cloneValidElement<Props>(
  element: React.ReactElement<Props> | React.ReactNode,
  props?: Partial<Props> & React.Attributes,
  ...children: React.ReactNode[]
): React.ReactElement<Props> | React.ReactNode {
  return isValidElement(element)
    ? cloneElement(element, props, ...children)
    : element;
}

export function createNamedContext<ContextValueType>(
  name: string,
  defaultValue: ContextValueType
): React.Context<ContextValueType> {
  const Ctx = createContext<ContextValueType>(defaultValue);
  Ctx.displayName = name;
  return Ctx;
}

/**
 * Get the scrollbar offset distance.
 */
export function getScrollbarOffset() {
  try {
    if (window.innerWidth > document.documentElement.clientWidth) {
      return window.innerWidth - document.documentElement.clientWidth;
    }
  } catch (err) {}
  return 0;
}

/**
 * Joins strings to format IDs for compound components.
 *
 * @param args
 */
export function makeId(...args: (string | number | null | undefined)[]) {
  return args.filter(val => val != null).join("--");
}

/**
 * No-op function.
 */
export function noop(): void {}

/**
 * React hook for creating a value exactly once.
 * @see https://github.com/Andarist/use-constant
 */
export function useConstant<ValueType>(fn: () => ValueType): ValueType {
  const ref = React.useRef<{ v: ValueType }>();
  if (!ref.current) {
    ref.current = { v: fn() };
  }
  return ref.current.v;
}

/**
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
export function useForkedRef<RefValueType = any>(
  ...refs: (AssignableRef<RefValueType> | null | undefined)[]
) {
  return useMemo(() => {
    if (refs.every(ref => ref == null)) {
      return null;
    }
    return (node: any) => {
      refs.forEach(ref => {
        assignRef(ref, node);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

/**
 * Returns the previous value of a reference after a component update.
 *
 * @param value
 */
export function usePrevious<ValueType = any>(value: ValueType) {
  const ref = useRef<ValueType | null>(null);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * Call an effect after a component update, skipping the initial mount.
 *
 * @param effect Effect to call
 * @param deps Effect dependency list
 */
export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
) {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      effect();
    } else {
      mounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Wraps a lib-defined event handler and a user-defined event handler, returning
 * a single handler that allows a user to prevent lib-defined handlers from
 * firing.
 *
 * @param theirHandler User-supplied event handler
 * @param ourHandler Library-supplied event handler
 */
export function wrapEvent<EventType extends React.SyntheticEvent | Event>(
  theirHandler: ((event: EventType) => any) | undefined,
  ourHandler: (event: EventType) => any
): (event: EventType) => any {
  return event => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      return ourHandler(event);
    }
  };
}

/**
 * This is a hack for sure. The thing is, getting a component to intelligently
 * infer props based on a component or JSX string passed into an `as` prop is
 * kind of a huge pain. Getting it to work and satisfy the constraints of
 * `forwardRef` seems dang near impossible. To avoid needing to do this awkward
 * type song-and-dance every time we want to forward a ref into a component
 * that accepts an `as` prop, we abstract all of that mess to this function for
 * the time time being.
 *
 * TODO: Eventually we should probably just try to get the type defs above
 * working across the board, but ain't nobody got time for that mess!
 *
 * @param Comp
 */
export function forwardRefWithAs<Props, ComponentType extends As>(
  comp: (
    props: PropsFromAs<ComponentType, Props>,
    ref: React.RefObject<any>
  ) => React.ReactElement | null
) {
  return (React.forwardRef(comp as any) as unknown) as ComponentWithAs<
    ComponentType,
    Props
  >;
}

export function getOwnerDocument<T extends HTMLElement = HTMLElement>(
  element: T | null
) {
  return element && element.ownerDocument
    ? element.ownerDocument
    : canUseDOM()
    ? document
    : null;
}

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
export let ponyfillGlobal =
  typeof window != "undefined" && window.Math == Math
    ? window
    : typeof self != "undefined" && self.Math == Math
    ? self
    : // eslint-disable-next-line no-new-func
      Function("return this")();

export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

export function isFunction(value: any): value is Function {
  return !!(value && {}.toString.call(value) == "[object Function]");
}

export function isNumber(value: any): value is number {
  return typeof value === "number";
}

export function isString(value: any): value is string {
  return typeof value === "string";
}

// Export types
export {
  As,
  AssignableRef,
  ComponentWithAs,
  ComponentWithForwardedRef,
  DistributiveOmit,
  PropsFromAs,
  PropsWithAs,
  SingleOrArray,
};
