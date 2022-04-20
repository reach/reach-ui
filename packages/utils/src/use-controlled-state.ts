import { useState, useRef, useCallback } from "react";
import type * as React from "react";
import warning from "tiny-warning";

/**
 * Check if a component is controlled or uncontrolled and return the correct
 * state value and setter accordingly. If the component state is controlled by
 * the app, the setter is a noop.
 *
 * @param controlledValue
 * @param defaultValue
 */
export function useControlledState<T = any>({
  controlledValue,
  defaultValue,
  calledFrom = "A component",
}: {
  controlledValue: T | undefined;
  defaultValue: T | (() => T);
  calledFrom?: string;
}): [T, React.Dispatch<React.SetStateAction<T>>] {
  let wasControlled = controlledValue !== undefined;
  let { current: isControlled } = useRef(wasControlled);

  if (__DEV__) {
    warning(
      !(!isControlled && wasControlled),
      `${calledFrom} is changing from controlled to uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
    );
    warning(
      !(isControlled && !wasControlled),
      `${calledFrom} is changing from uncontrolled to controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
    );
  }

  let [valueState, setValue] = useState(defaultValue);
  let set: React.Dispatch<React.SetStateAction<T>> = useCallback((n) => {
    if (!isControlled) {
      setValue(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [isControlled ? (controlledValue as T) : valueState, set];
}
