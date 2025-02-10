import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, cleanupHooks, actHooks } from "@reach-internal/test/utils";
import { useUpdateEffect } from "@reach/utils";

afterEach(cleanupHooks);

describe("useUpdateEffect", () => {
	it("should do not call effect on mount", () => {
		const effect = vi.fn();
		renderHook(() => useUpdateEffect(effect, []));

		expect(effect).not.toHaveBeenCalled();
	});

	it("should call effect on every update", () => {
		const effect = vi.fn();
		const { result } = renderHook(() => {
			const [dependency, setDependency] = useState(0);
			useUpdateEffect(effect, [dependency]);
			return { setDependency };
		});

		actHooks(() => result.current.setDependency(10));
		expect(effect).toHaveBeenCalledTimes(1);
		actHooks(() => result.current.setDependency(22));
		expect(effect).toHaveBeenCalledTimes(2);
	});
});
