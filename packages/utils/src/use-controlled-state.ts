import { useState, useRef, useCallback } from "react";
import type * as React from "react";

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
