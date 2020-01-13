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
export function makeId(...args: (string | number)[]) {
  return args.join("--");
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
 * useLayoutEffect in the browser. We occasionally need useLayoutEffect to ensure
 * we don't get a render flash for certain operations, but we may also need
 * affected components to render on the server. One example is when setting a
 * component's descendants to retrieve their index values. The index value may be
 * needed to determine whether a descendant is active, but with useEffect in the
 * browser there will be an initial frame where the active descendant is not set.
 *
 * Important to note that using this hook as an escape hatch will break the
 * eslint dependency warnings, so use sparingly only when needed and pay close
 * attention to the dependency array!
 *
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
 * This is a hack to stop TS errors from dynamic components with an `as` prop
 * TODO: Eventually we should probably just try to get the type defs above
 * working across the board, but ain't nobody got time for that mess!
 *
 * @param Comp
 */
export function forwardRefWithAs<T extends As, P>(
  Comp: (props: PropsFromAs<T, P>, ref: React.RefObject<any>) => JSX.Element
) {
  return React.forwardRef(Comp as any) as ComponentWithAs<T, P>;
}

// Export types
export {
  As,
  AssignableRef,
  ComponentWithAs,
  ComponentWithForwardedRef,
  PropsFromAs,
  PropsWithAs
};

////////////////////////////////////////////////////////////////////////////////

export type DescendantElement<T = HTMLElement> =
  | (T extends HTMLElement ? T : HTMLElement)
  | null;

export type Descendant<T> = {
  element: DescendantElement<T>;
  key?: string | number | null;
  disabled?: boolean;
};

export interface IDescendantContext<T> {
  descendants: Descendant<T>[];
  focusNodes: DescendantElement<T>[];
  registerDescendant(descendant: Descendant<T>): void;
  unregisterDescendant(element: Descendant<T>["element"]): void;
}

const DescendantContext = createNamedContext<IDescendantContext<any>>(
  "DescendantContext",
  {} as IDescendantContext<any>
);

export function useDescendantContext<T>() {
  return useContext(DescendantContext as React.Context<IDescendantContext<T>>);
}

////////////////////////////////////////////////////////////////////////////////
// TODO: Move to @reach/descendants once fully tested and implemented

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
export function useDescendant<T>(
  { element, key, disabled }: Descendant<T>,
  indexProp?: number
) {
  let [, forceUpdate] = useState();
  let {
    registerDescendant,
    unregisterDescendant,
    descendants
  } = useDescendantContext<T>();

  // Prevent any flashing
  useIsomorphicLayoutEffect(() => {
    if (!element) forceUpdate({});
    registerDescendant({ element, key, disabled });
    return () => unregisterDescendant(element);
  }, [element, key, disabled]);

  return (
    indexProp ?? descendants.findIndex(({ element: _el }) => _el === element)
  );
}

export function useDescendants<T>() {
  return useState<Descendant<T>[]>([]);
}

export function DescendantProvider<T>({
  children,
  descendants,
  setDescendants
}: {
  children: React.ReactNode;
  descendants: Descendant<T>[];
  setDescendants: React.Dispatch<React.SetStateAction<Descendant<T>[]>>;
}) {
  let registerDescendant = React.useCallback(
    ({ disabled, element, key: providedKey }: Descendant<T>) => {
      if (!element) {
        return;
      }

      setDescendants(items => {
        if (items.find(({ element: _el }) => _el === element) == null) {
          let key = providedKey ?? element.textContent;

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

          let newItem = { disabled, element, key };

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

      setDescendants(items =>
        items.filter(({ element: _el }) => element !== _el)
      );
    },
    /*
     * setDescendants is a state setter initialized by the useDescendants hook.
     * We can safely ignore the lint warning here because it will not change
     * between renders.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  let focusNodes = descendants
    .filter(({ disabled }) => !disabled)
    .map(({ element }) => element);

  const value: IDescendantContext<T> = useMemo(() => {
    return {
      descendants,
      focusNodes,
      registerDescendant,
      unregisterDescendant
    };
  }, [descendants, focusNodes, registerDescendant, unregisterDescendant]);

  return (
    <DescendantContext.Provider value={value}>
      {children}
    </DescendantContext.Provider>
  );
}
