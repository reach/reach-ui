/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useEffect, useCallback } from "react";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "./use-isomorphic-layout-effect";
import type * as React from "react";

/**
 * Converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop and exposed as a stable function to avoid executing effects when
 * passed as a dependency.
 */
function createStableCallbackHook<T extends (...args: any[]) => any>(
  useEffectHook: (
    effect: React.EffectCallback,
    deps?: React.DependencyList | undefined
  ) => void,
  callback: T | null | undefined
): T {
  let callbackRef = useRef(callback);
  useEffectHook(() => {
    callbackRef.current = callback;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args) => {
      callbackRef.current && callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop and exposed as a stable function to avoid executing effects when passed
 * as a dependency.
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T | null | undefined
): T {
  return createStableCallbackHook(useEffect, callback);
}

/**
 * Converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop and exposed as a stable function to avoid executing effects when passed
 * as a dependency.
 *
 * Use this over `useStableCallback` when you want the callback to be cached in
 * `useLayoutEffect` instead of `useEffect` to deal with timing issues only when
 * needed.
 */
export function useStableLayoutCallback<T extends (...args: any[]) => any>(
  callback: T | null | undefined
): T {
  return createStableCallbackHook(useLayoutEffect, callback);
}
