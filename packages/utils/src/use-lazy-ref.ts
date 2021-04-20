import { useRef } from "react";
import type * as React from "react";

export function useLazyRef<F extends (...args: any[]) => any>(
  fn: F
): React.MutableRefObject<ReturnType<F>> {
  let isSet = useRef(false);
  let ref = useRef<any>();
  if (!isSet.current) {
    isSet.current = true;
    ref.current = fn();
  }
  return ref;
}
