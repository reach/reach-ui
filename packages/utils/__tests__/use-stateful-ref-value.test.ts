import { useRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { renderHook, cleanupHooks, actHooks } from "@reach-internal/test/utils";
import { useStatefulRefValue } from "@reach/utils";

afterEach(cleanupHooks);

describe("useStatefulRefValue", () => {
	it("should return value and setter", () => {
		const { result } = renderHook(() => {
			const ref = useRef();
			return useStatefulRefValue(ref, 10);
		});

		expect(result.current[0]).toBe(10);
		expect(typeof result.current[1]).toBe("function");
	});

	it("should update ref's value", () => {
		const { result } = renderHook(() => {
			const ref = useRef();
			return {
				statefulRefValue: useStatefulRefValue(ref, 10 as number),
				ref,
			};
		});

		actHooks(() => result.current.statefulRefValue[1](42));
		expect(result.current.ref.current).toBe(42);
		expect(result.current.ref.current).toBe(result.current.statefulRefValue[0]);

		actHooks(() => result.current.statefulRefValue[1](100500));
		expect(result.current.ref.current).toBe(100500);
		expect(result.current.ref.current).toBe(result.current.statefulRefValue[0]);
	});
});
