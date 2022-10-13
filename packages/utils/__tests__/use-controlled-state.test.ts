import { afterEach, describe, expect, it } from "vitest";
import { renderHook, cleanupHooks, actHooks } from "@reach-internal/test/utils";
import { useControlledState } from "@reach/utils";

afterEach(cleanupHooks);

describe("useControlledState", () => {
	const DEFAULT_VALUE = 10;
	const CONTROLLED_VALUE = 42;

	it("should return value and setter", () => {
		const { result } = renderHook(() =>
			useControlledState({
				defaultValue: DEFAULT_VALUE,
				controlledValue: undefined,
			})
		);

		expect(result.current[0]).toBe(DEFAULT_VALUE);
		expect(typeof result.current[1]).toBe("function");
	});

	it("should work as uncontrolled", () => {
		const { result } = renderHook(() =>
			useControlledState({
				defaultValue: DEFAULT_VALUE,
				controlledValue: undefined,
			})
		);
		expect(result.current[0]).toBe(DEFAULT_VALUE);
		actHooks(() => {
			result.current[1](17);
		});
		expect(result.current[0]).toBe(17);
	});

	it("should work as controlled", () => {
		const { result } = renderHook(() =>
			useControlledState({
				defaultValue: DEFAULT_VALUE,
				controlledValue: CONTROLLED_VALUE,
			})
		);
		expect(result.current[0]).toBe(CONTROLLED_VALUE);
		actHooks(() => {
			result.current[1](17);
		});
		expect(result.current[0]).toBe(CONTROLLED_VALUE);
	});
});
