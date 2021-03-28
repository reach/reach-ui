import { useRef } from "react";

/**
 * React hook for creating a value exactly once.
 * @see https://github.com/Andarist/use-constant
 */
export function useConstant<ValueType>(fn: () => ValueType): ValueType {
  const ref = useRef<{ v: ValueType }>();
  if (!ref.current) {
    ref.current = { v: fn() };
  }
  return ref.current.v;
}
