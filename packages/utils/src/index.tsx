/* eslint-disable no-unused-vars */

import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  As,
  AssignableRef,
  ComponentWithAs,
  ComponentWithForwardedRef,
  DistributiveOmit,
  PropsFromAs,
  PropsWithAs
} from "./types";
import React from "react";

let checkedPkgs: { [key: string]: boolean } = {};

/**
 * When in dev mode, checks that styles for a given @reach package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example checkStyles("dialog") will check for styles for @reach/dialog
 */
// @ts-ignore
let checkStyles = (packageName: string): void => {};

if (__DEV__) {
  checkStyles = (pkg: string) => {
    // only check once per package
    if (checkedPkgs[pkg]) return;
    checkedPkgs[pkg] = true;

    if (
      process.env.NODE_ENV !== "test" &&
      parseInt(
        window
          .getComputedStyle(document.body)
          .getPropertyValue(`--reach-${pkg}`),
        10
      ) !== 1
    ) {
      console.warn(
        `@reach/${pkg} styles not found. If you are using a bundler like webpack or parcel include this in the entry file of your app before any of your own styles:

    import "@reach/${pkg}/styles.css";

  Otherwise you'll need to include them some other way:

    <link rel="stylesheet" type="text/css" href="node_modules/@reach/${pkg}/styles.css" />

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
export function assignRef<T = any>(ref: AssignableRef<T>, value: any) {
  if (ref == null) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    try {
      // @ts-ignore
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
}

export function boolOrBoolString(value: any) {
  return value === "false" ? false : Boolean(value);
}

export function canUseDOM() {
  return (
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  );
}

export function cloneValidElement<P>(
  element: React.ReactElement<P> | React.ReactNode,
  props?: Partial<P> & React.Attributes,
  ...children: React.ReactNode[]
): React.ReactElement<P> | React.ReactNode {
  if (!isValidElement(element)) {
    return element;
  }
  return cloneElement(element, props, ...children);
}

export function createNamedContext<T>(
  name: string,
  defaultValue: T
): React.Context<T> {
  const Ctx = createContext<T>(defaultValue);
  Ctx.displayName = name;
  return Ctx;
}

export function findLastIndex<T = any>(
  array: T[],
  predicate: (element: T, index?: number, arr?: T[]) => boolean
): number {
  let length = array.length >>> 0;
  if (!length) {
    return -1;
  }
  let n = length - 1;
  while (n >= 0) {
    let value = array[n];
    if (predicate(value, n, array)) {
      return n;
    }
    --n;
  }
  return -1;
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

export function isUndefined(value: any) {
  return typeof value === "undefined";
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
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
export function useForkedRef<T = any>(...refs: AssignableRef<T>[]) {
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
 * https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
 * https://github.com/reduxjs/react-redux/blob/master/src/utils/useIsomorphicLayoutEffect.js
 *
 * @param effect
 * @param deps
 */
export const useIsomorphicLayoutEffect = canUseDOM()
  ? useLayoutEffect
  : useEffect;

/**
 * Returns the previous value of a reference after a component update.
 *
 * @param value
 */
export function usePrevious<T = any>(value: T) {
  const ref = useRef<T | null>(null);
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
export function useUpdateEffect(effect: () => any, deps?: any[]) {
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
export function wrapEvent<E extends React.SyntheticEvent | Event>(
  theirHandler: ((event: E) => any) | undefined,
  ourHandler: (event: E) => any
): (event: E) => any {
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
 * kind of a huge pain. Getting it to work and satisfy the contraints of
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
export function forwardRefWithAs<P, T extends As>(
  comp: (props: PropsFromAs<T, P>, ref: React.RefObject<any>) => JSX.Element
) {
  return React.forwardRef(comp as any) as ComponentWithAs<T, P>;
}

// Export types
export {
  As,
  AssignableRef,
  ComponentWithAs,
  ComponentWithForwardedRef,
  DistributiveOmit,
  PropsFromAs,
  PropsWithAs
};

////////////////////////////////////////////////////////////////////////////////
// TODO: Move to @reach/descendants once fully tested and implemented

export type Descendant<T, P = {}> = P & {
  element: (T extends HTMLElement ? T : HTMLElement) | null;
};

export interface IDescendantContext<T, P> {
  descendants: Descendant<T, P>[];
  registerDescendant(descendant: Descendant<T, P>): void;
  unregisterDescendant(
    element: (T extends HTMLElement ? T : HTMLElement) | null
  ): void;
}

export function createDescendantContext<T, P = {}>(
  name: string,
  initialValue = {}
) {
  return createNamedContext(name, {
    descendants: [],
    registerDescendant: noop,
    unregisterDescendant: noop,
    ...initialValue
  } as IDescendantContext<T, P>);
}

/**
 * This hook registers our descendant by passing it into an array. We can then
 * search that array by to find its index when registering it in the component.
 * We use this for focus management, keyboard navigation, and typeahead
 * functionality for some components.
 *
 * The hook accepts the element node and (optionally) a key. The key is useful
 * if multiple descendants have identical text values and we need to
 * differentiate siblings for some reason.
 *
 * Our main goals with this are:
 *   1) maximum composability,
 *   2) minimal API friction
 *   3) SSR compatibility*
 *   4) concurrent safe
 *   5) index always up-to-date with the tree despite changes
 *   6) works with memoization of any component in the tree (hopefully)
 *
 * * As for SSR, the good news is that we don't actually need the index on the
 * server for most use-cases, as we are only using it to determine the order of
 * composed descendants for keyboard navigation. However, in the few cases where
 * this is not the case, we can require an explicit index from the app.
 */
export function useDescendant<T, P>(
  {
    context,
    element,
    ...rest
  }: Descendant<T, P> & { context: React.Context<IDescendantContext<T, P>> },
  indexProp?: number
) {
  let [, forceUpdate] = useState();
  let { registerDescendant, unregisterDescendant, descendants } = useContext(
    context
  );

  // Prevent any flashing
  useIsomorphicLayoutEffect(() => {
    if (!element) forceUpdate({});
    // @ts-ignore
    registerDescendant({ element, ...rest });
    return () => unregisterDescendant(element);
  }, [element, ...Object.values(rest)]);

  return (
    indexProp ?? descendants.findIndex(({ element: _el }) => _el === element)
  );
}

export function useDescendants<T, P = {}>() {
  return useState<Descendant<T, P>[]>([]);
}

export function DescendantProvider<T, P>({
  context: Ctx,
  children,
  items,
  set
}: {
  context: React.Context<IDescendantContext<T, P>>;
  children: React.ReactNode;
  items: Descendant<T, P>[];
  set: React.Dispatch<React.SetStateAction<Descendant<T, P>[]>>;
}) {
  let registerDescendant = React.useCallback(
    ({ element, ...rest }: Descendant<T, P>) => {
      if (!element) {
        return;
      }

      set(items => {
        if (items.find(({ element: _el }) => _el === element) == null) {
          /*
           * When registering a descendant, we need to make sure we insert in
           * into the array in the same order that it appears in the DOM. So as
           * new descendants are added or maybe some are removed, we always know
           * that the array is up-to-date and correct.
           *
           * So here we look at our registered descendants and see if the new
           * element we are adding appears earlier than an existing descendant's
           * DOM node via `node.compareDocumentPosition`. If it does, we insert
           * the new element at this index. Because `registerDescendant` will be
           * called in an effect every time the descendants state value changes,
           * we should be sure that this index is accurate when descendent
           * elements come or go from our component.
           */
          let index = items.findIndex(({ element: existingElement }) => {
            if (!existingElement || !element) {
              return false;
            }
            /*
             * Does this element's DOM node appear before another item in the
             * array in our DOM tree? If so, return true to grab the index at
             * this point in the array so we know where to insert the new
             * element.
             */
            return Boolean(
              existingElement.compareDocumentPosition(element) &
                Node.DOCUMENT_POSITION_PRECEDING
            );
          });

          let newItem = { element, ...rest } as Descendant<T, P>;

          // If an index is not found we will push the element to the end.
          if (index === -1) {
            return [...items, newItem];
          }
          return [...items.slice(0, index), newItem, ...items.slice(index)];
        }
        return items;
      });
    },
    /*
     * setDescendants is a state setter initialized by the useDescendants hook.
     * We can safely ignore the lint warning here because it will not change
     * between renders.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  let unregisterDescendant = useCallback(
    (element: Descendant<T>["element"]) => {
      if (!element) {
        return;
      }

      set(items => items.filter(({ element: _el }) => element !== _el));
    },
    /*
     * setDescendants is a state setter initialized by the useDescendants hook.
     * We can safely ignore the lint warning here because it will not change
     * between renders.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Not sure about this just yet, may bail on this and let components deal
  /* let focusNodes = descendants
    .filter(({ disabled }) => !disabled)
    .map(({ element }) => element); */

  // @ts-ignore
  const value: IDescendantContext<T, P> = useMemo(() => {
    return {
      descendants: items,
      registerDescendant,
      unregisterDescendant
    };
  }, [items, registerDescendant, unregisterDescendant]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
