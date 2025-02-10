import { afterEach, describe, expect, it } from "vitest";
import { renderHook, cleanupHooks } from "@reach-internal/test/utils";
import { useConstant } from "@reach/utils";

afterEach(cleanupHooks);

describe("useConstant", () => {
	const renderUseConstant = () =>
		renderHook(() => useConstant(() => ({ foo: "bar" })));

	it("should return value from callback", () => {
		const render = renderUseConstant();

		const firstRenderedObject = render.result.current;
		expect(firstRenderedObject).toEqual({ foo: "bar" });
	});

	it("should return the same value after rerender", () => {
		const render = renderUseConstant();
		const resultFirst = render.result.current;
		render.rerender();
		const resultSecond = render.result.current;

		expect(resultFirst).toBe(resultSecond);
	});
});
