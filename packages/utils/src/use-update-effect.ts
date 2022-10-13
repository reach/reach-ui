import { useRef, useEffect } from "react";
import type * as React from "react";

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
	useEffect(() => {
		if (mounted.current) {
			return effect();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	const mounted = useRef(false);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
}
