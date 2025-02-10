import { afterEach, describe, expect, it } from "vitest";
import { renderHook, cleanupHooks } from "@reach-internal/test/utils";
import { useLazyRef } from "@reach/utils";

afterEach(cleanupHooks);

describe("useLazyRef", () => {
	const renderUseLazyRef = () =>
		renderHook(() => useLazyRef(() => ({ foo: "bar" })));

	it("should return value from callback", () => {
		const render = renderUseLazyRef();

		const firstRenderedObject = render.result.current.current;
		expect(firstRenderedObject).toEqual({ foo: "bar" });
	});

	it("should return the same value after rerender", () => {
		const render = renderUseLazyRef();
		const resultFirst = render.result.current.current;
		render.rerender();
		const resultSecond = render.result.current.current;

		expect(resultFirst).toBe(resultSecond);
	});
});
