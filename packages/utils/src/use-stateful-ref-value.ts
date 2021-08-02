import { useState, useCallback } from "react";

export function useStatefulRefValue<V>(
  ref: React.RefObject<V>,
  initialState: V
): [V, (refValue: Exclude<V, null>) => void] {
  let [state, setState] = useState(initialState);
  let callbackRef = useCallback((refValue: Exclude<V, null>) => {
    (ref as React.MutableRefObject<V>).current = refValue;
    setState(refValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [state, callbackRef];
}
