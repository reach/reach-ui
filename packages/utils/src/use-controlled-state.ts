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
  let isControlledRef = useRef(wasControlled);

  if (process.env.NODE_ENV === "development") {
    if (!isControlledRef.current && wasControlled) {
      console.warn(
        `${calledFrom} is changing from controlled to uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      );
    }

    if (isControlledRef.current && !wasControlled) {
      console.warn(
        `${calledFrom} is changing from uncontrolled to controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      );
    }
  }

  let [valueState, setValue] = useState(
    isControlledRef.current ? controlledValue! : defaultValue
  );
  let set: React.Dispatch<React.SetStateAction<T>> = useCallback((n) => {
    if (!isControlledRef.current) {
      setValue(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [isControlledRef.current ? (controlledValue as T) : valueState, set];
}
