import { useCallback } from "react";
import { isFunction } from "./type-check";
import type { AssignableRef } from "./types";

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
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
export function useComposedRefs<RefValueType = any>(
  ...refs: (AssignableRef<RefValueType> | null | undefined)[]
) {
  return useCallback((node: any) => {
    for (let ref of refs) {
      assignRef(ref, node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}
