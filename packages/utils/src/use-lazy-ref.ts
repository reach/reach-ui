import { useRef } from "react";
import type * as React from "react";

export function useLazyRef<ValueType>(
	fn: () => ValueType
): React.MutableRefObject<ValueType> {
	let isSet = useRef(false);
	let ref = useRef<ValueType>();
	if (!isSet.current) {
		isSet.current = true;
		ref.current = fn();
	}
	return ref as React.MutableRefObject<ValueType>;
}
