import { useState, useCallback } from "react";

/**
 * Forces a re-render, similar to `forceUpdate` in class components.
 */
export function useForceUpdate() {
  let [, dispatch] = useState<{}>(Object.create(null));
  return useCallback(() => {
    dispatch(Object.create(null));
  }, []);
}
