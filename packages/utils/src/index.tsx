/* eslint-disable no-restricted-globals, eqeqeq  */

import React, {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import warning from "warning";
import {
  As,
  AssignableRef,
  ComponentWithAs,
  ComponentWithForwardedRef,
  DistributiveOmit,
  ElementByTag,
  ElementTagNameMap,
  ForwardRefExoticComponentWithAs,
  ForwardRefWithAsRenderFunction,
  FunctionComponentWithAs,
  MemoExoticComponentWithAs,
  PropsFromAs,
  PropsWithAs,
  SingleOrArray,
  ThenArg,
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

let checkedPkgs: { [key: string]: boolean } = {};

/**
 * Copy of Facebook's warning package.
 */
export { warning };

/**
 * When in dev mode, checks that styles for a given @reach package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example checkStyles("dialog") will check for styles for @reach/dialog
 */
// @ts-ignore
let checkStyles: (packageName: string) => void = noop;

if (__DEV__) {
  // In CJS files, process.env.NODE_ENV is stripped from our build, but we need
  // it to prevent style checks from clogging up user logs while testing.
  // This is a workaround until we can tweak the build a bit to accommodate.
  let { env } =
    typeof process !== "undefined"
      ? process
      : { env: { NODE_ENV: "development" } };

  checkStyles = function checkStyles(packageName: string) {
    // only check once per package
    if (checkedPkgs[packageName]) return;
    checkedPkgs[packageName] = true;

    if (
      env.NODE_ENV !== "test" &&
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
 * Ponyfill for the global object in some environments.
 *
 * @link https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
 */
export const ponyfillGlobal =
  typeof window != "undefined" && window.Math == Math
    ? window
    : typeof self != "undefined" && self.Math == Math
    ? self
    : // eslint-disable-next-line no-new-func
      Function("return this")();

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

/**
 * Checks true|"true" vs false|"false"
 *
 * @param value
 */
export function boolOrBoolString(value: any): value is "true" | true {
  return value === "true" ? true : isBoolean(value) ? value : false;
}

export function canUseDOM() {
  return !!(
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
  );
}

/**
 * Type-safe clone element
 *
 * @param element
 * @param props
 * @param children
 */
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
 * This is a hack for sure. The thing is, getting a component to intelligently
 * infer props based on a component or JSX string passed into an `as` prop is
 * kind of a huge pain. Getting it to work and satisfy the constraints of
 * `forwardRef` seems dang near impossible. To avoid needing to do this awkward
 * type song-and-dance every time we want to forward a ref into a component
 * that accepts an `as` prop, we abstract all of that mess to this function for
 * the time time being.
 */
export function forwardRefWithAs<Props, ComponentType extends As = "div">(
  render: ForwardRefWithAsRenderFunction<ComponentType, Props>
) {
  return React.forwardRef(render) as ForwardRefExoticComponentWithAs<
    ComponentType,
    Props
  >;
}

export function memoWithAs<Props, ComponentType extends As = "div">(
  Component: FunctionComponentWithAs<ComponentType, Props>,
  propsAreEqual?: (
    prevProps: Readonly<React.PropsWithChildren<Props>>,
    nextProps: Readonly<React.PropsWithChildren<Props>>
  ) => boolean
) {
  return React.memo(Component, propsAreEqual) as MemoExoticComponentWithAs<
    ComponentType,
    Props
  >;
}

/**
 * Get the size of the working document minus the scrollbar offset.
 *
 * @param element
 */
export function getDocumentDimensions(
  element?: HTMLElement | null | undefined
) {
  if (!canUseDOM()) return { width: 0, height: 0 };
  let doc = element ? getOwnerDocument(element)! : document;
  let win = element ? getOwnerWindow(element)! : window;
  return {
    width: doc.documentElement.clientWidth || win.innerWidth,
    height: doc.documentElement.clientHeight || win.innerHeight,
  };
}

/**
 * Get the scoll position of the global window object relative to a given node.
 *
 * @param element
 */
export function getScrollPosition(element?: HTMLElement | null | undefined) {
  if (!canUseDOM()) return { scrollX: 0, scrollY: 0 };
  let win = element ? getOwnerWindow(element)! : window;
  return {
    scrollX: win.scrollX,
    scrollY: win.scrollY,
  };
}

/**
 * Get a computed style value by property, backwards compatible with IE
 * @param element
 * @param styleProp
 */
export function getElementComputedStyle(
  element: HTMLElement & {
    currentStyle?: Record<string, string>;
  },
  styleProp: string
) {
  let y: string | null = null;
  let doc = getOwnerDocument(element);
  if (element.currentStyle) {
    y = element.currentStyle[styleProp];
  } else if (
    doc &&
    doc.defaultView &&
    isFunction(doc.defaultView.getComputedStyle)
  ) {
    y = doc.defaultView
      .getComputedStyle(element, null)
      .getPropertyValue(styleProp);
  }
  return y;
}

/**
 * Get an element's owner document. Useful when components are used in iframes
 * or other environments like dev tools.
 *
 * @param element
 */
export function getOwnerDocument<T extends HTMLElement = HTMLElement>(
  element: T | null
) {
  return element && element.ownerDocument
    ? element.ownerDocument
    : canUseDOM()
    ? document
    : null;
}

export function getOwnerWindow<T extends HTMLElement = HTMLElement>(
  element: T | null
) {
  let doc = element ? getOwnerDocument(element) : null;
  return doc ? doc.defaultView || window : null;
}

/**
 * Get the scrollbar offset distance.
 *
 * TODO: Remove in 1.0 (we used this in public examples)
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
 * Checks whether or not a value is a boolean.
 *
 * @param value
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

/**
 * Checks whether or not a value is a function.
 *
 * @param value
 */
export function isFunction(value: any): value is Function {
  return !!(value && {}.toString.call(value) == "[object Function]");
}

/**
 * Checks whether or not a value is a number.
 *
 * @param value
 */
export function isNumber(value: any): value is number {
  return typeof value === "number";
}

/**
 * Detects right clicks
 *
 * @param nativeEvent
 */
export function isRightClick(nativeEvent: MouseEvent) {
  return nativeEvent.which === 3 || nativeEvent.button === 2;
}

/**
 * Checks whether or not a value is a string.
 *
 * @param value
 */
export function isString(value: any): value is string {
  return typeof value === "string";
}

/**
 * Joins strings to format IDs for compound components.
 *
 * @param args
 */
export function makeId(...args: (string | number | null | undefined)[]) {
  return args.filter((val) => val != null).join("--");
}

/**
 * No-op function.
 */
export function noop(): void {}

/**
 * Convert our state strings for HTML data attributes.
 * No need for a fancy kebab-caser here, we know what our state strings are!
 *
 * @param state
 */
export function stateToAttributeString(state: any) {
  return String(state)
    .replace(/([\s_]+)/g, "-")
    .toLowerCase();
}

/**
 * Check if a component is controlled or uncontrolled and return the correct
 * state value and setter accordingly. If the component state is controlled by
 * the app, the setter is a noop.
 *
 * @param controlledValue
 * @param defaultValue
 */
export function useControlledState<T = any>(
  controlledValue: T | undefined,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  let controlledRef = useRef(controlledValue != null);
  let [valueState, setValue] = useState(defaultValue);
  let set: React.Dispatch<React.SetStateAction<T>> = useCallback((n) => {
    if (!controlledRef.current) {
      setValue(n);
    }
  }, []);
  return [controlledRef.current ? (controlledValue as T) : valueState, set];
}

/**
 * Logs a warning in dev mode when a component switches from controlled to
 * uncontrolled, or vice versa
 *
 * A single prop should typically be used to determine whether or not a
 * component is controlled or not.
 *
 * @param controlledValue
 * @param controlledPropName
 * @param componentName
 */
let useControlledSwitchWarning: (
  controlledValue: any,
  controlledPropName: string,
  componentName: string
) => void = noop;

if (__DEV__) {
  useControlledSwitchWarning = function useControlledSwitchWarning(
    controlledValue,
    controlledPropName,
    componentName
  ) {
    let controlledRef = useRef(controlledValue != null);
    let nameCache = useRef({ componentName, controlledPropName });
    useEffect(() => {
      nameCache.current = { componentName, controlledPropName };
    }, [componentName, controlledPropName]);

    useEffect(() => {
      let { current: wasControlled } = controlledRef;
      let { componentName, controlledPropName } = nameCache.current;
      let isControlled = controlledValue != null;
      if (wasControlled !== isControlled) {
        console.error(
          `A component is changing an ${
            wasControlled ? "" : "un"
          }controlled \`${controlledPropName}\` state of ${componentName} to be ${
            wasControlled ? "un" : ""
          }controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled ${componentName} element for the lifetime of the component.
More info: https://fb.me/react-controlled-components`
        );
      }
    }, [controlledValue]);
  };
}

export { useControlledSwitchWarning };

let useCheckStyles: (packageName: string) => void = noop;

if (__DEV__) {
  useCheckStyles = function useCheckStyles(pkg: string) {
    let name = useRef(pkg);
    useEffect(() => void (name.current = pkg), [pkg]);
    useEffect(() => checkStyles(name.current), []);
  };
}

export { useCheckStyles };

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
 * @param callback
 */
export function useEventCallback<E extends Event | React.SyntheticEvent>(
  callback: (event: E, ...args: any[]) => void
) {
  const ref = useRef(callback);
  useIsomorphicLayoutEffect(() => {
    ref.current = callback;
  });
  return useCallback(
    (event: E, ...args: any[]) => ref.current(event, ...args),
    []
  );
}

/**
 * @param callback
 */
export function useCallbackProp<F extends Function>(callback: F | undefined) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });
  return (useCallback(
    (...args: any[]) => ref.current && ref.current(...args),
    []
  ) as unknown) as F;
}

/**
 * Adds a DOM event listener
 *
 * @param eventName
 * @param listener
 * @param element
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  listener: (event: WindowEventMap[K]) => any,
  element: HTMLElement | Document | Window | EventTarget = window
) {
  const savedHandler = useRef(listener);
  useEffect(() => {
    savedHandler.current = listener;
  }, [listener]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) {
      if (__DEV__) {
        console.warn("Event listener not supported on the element provided");
      }
      return;
    }

    function eventListener(event: WindowEventMap[K]) {
      savedHandler.current(event);
    }

    element.addEventListener(eventName, eventListener as any);
    return () => {
      element.removeEventListener(eventName, eventListener as any);
    };
  }, [eventName, element]);
}

/**
 * Detect when focus changes in our document.
 *
 * @param handleChange
 * @param when
 * @param ownerDocument
 */
export function useFocusChange(
  handleChange: (
    activeElement: Element | null,
    previousActiveElement: Element | null,
    event?: FocusEvent
  ) => void = console.log,
  when: "focus" | "blur" = "focus",
  ownerDocument: Document = document
) {
  let lastActiveElement = useRef(ownerDocument.activeElement);

  useEffect(() => {
    lastActiveElement.current = ownerDocument.activeElement;

    function onChange(event: FocusEvent) {
      if (lastActiveElement.current !== ownerDocument.activeElement) {
        handleChange(
          ownerDocument.activeElement,
          lastActiveElement.current,
          event
        );
        lastActiveElement.current = ownerDocument.activeElement;
      }
    }

    ownerDocument.addEventListener(when, onChange, true);

    return () => {
      ownerDocument.removeEventListener(when, onChange);
    };
  }, [when, handleChange, ownerDocument]);
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
    if (refs.every((ref) => ref == null)) {
      return null;
    }
    return (node: any) => {
      refs.forEach((ref) => {
        assignRef(ref, node);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...refs]);
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
 * Just a lil state logger
 *
 * @param state
 * @param DEBUG
 */
let useStateLogger: (state: string, DEBUG: boolean) => void = noop;

if (__DEV__) {
  useStateLogger = function useStateLogger(state, DEBUG = false) {
    let debugRef = useRef(DEBUG);
    useEffect(() => {
      debugRef.current = DEBUG;
    }, [DEBUG]);
    useEffect(() => {
      if (debugRef.current) {
        console.group("State Updated");
        console.log(
          "%c" + state,
          "font-weight: normal; font-size: 120%; font-style: italic;"
        );
        console.groupEnd();
      }
    }, [state]);
  };
}

export { useStateLogger };

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
  return (event) => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      return ourHandler(event);
    }
  };
}

// Export types
export {
  As,
  AssignableRef,
  ComponentWithAs,
  ComponentWithForwardedRef,
  DistributiveOmit,
  ElementByTag,
  ElementTagNameMap,
  ForwardRefExoticComponentWithAs,
  FunctionComponentWithAs,
  MemoExoticComponentWithAs,
  PropsFromAs,
  PropsWithAs,
  SingleOrArray,
  ThenArg,
};
