import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, cleanupHooks } from "@reach-internal/test/utils";
import { useStableCallback, useStableLayoutCallback } from "@reach/utils";
import { useEffect } from "react";

afterEach(cleanupHooks);

describe("useStableCallback", () => {
	it("should not cause the effect to be called again on change", () => {
		const mock = vi.fn();
		const { rerender } = renderHook(() => {
			const callback = () => mock();
			const stableCallback = useStableCallback(callback);
			useEffect(stableCallback, [stableCallback]);
		});

		const calledTimesBeforeRerender = mock.mock.calls.length;
		rerender();
		const calledTimesAfterRerender = mock.mock.calls.length;
		expect(calledTimesBeforeRerender).toBe(calledTimesAfterRerender);
	});
});

describe("useStableLayoutCallback", () => {
	it("should not cause the effect to be called again on change", () => {
		const mock = vi.fn();
		const { rerender } = renderHook(() => {
			const callback = () => mock();
			const stableCallback = useStableLayoutCallback(callback);
			useEffect(stableCallback, [stableCallback]);
		});

		const calledTimesBeforeRerender = mock.mock.calls.length;
		rerender();
		const calledTimesAfterRerender = mock.mock.calls.length;
		expect(calledTimesBeforeRerender).toBe(calledTimesAfterRerender);
	});
});
